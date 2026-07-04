import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../config/db.js';
import { sendResetOtpEmail, sendRegistrationOtpEmail } from '../config/emailService.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'abhi_kaun_free_hai_secret_key_123';

// Temporary registration store (valid for 10 minutes)
const pendingRegistrations = new Map();

// Register User (Step 1: Initiate & Send OTP)
router.post('/register', async (req, res) => {
  try {
    let { name, email, phone, password, confirmPassword, role, serviceType, experience } = req.body;

    name = name ? name.trim() : '';
    email = email ? email.trim() : '';
    phone = phone ? phone.trim() : '';
    password = password ? password.trim() : '';
    confirmPassword = confirmPassword ? confirmPassword.trim() : '';

    if (!name || !email || !phone || !password || !confirmPassword || !role) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    // Password restriction: at least 8 characters, at least 1 numeric character and 1 special character
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);
    if (password.length < 8 || !hasNumber || !hasSpecial) {
      return res.status(400).json({ 
        error: 'Password must be at least 8 characters long and contain at least one numeric character and one special character (e.g. @, $, !, %, etc.)' 
      });
    }

    // Check if user already exists
    const existingUser = db.users.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Generate a 6-digit verification code
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const registrationId = Math.random().toString(36).substr(2, 9);
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Save pending registration details
    pendingRegistrations.set(registrationId, {
      userData: {
        name,
        email,
        phone,
        password: hashedPassword,
        role,
        serviceType,
        experience,
        walletBalance: 5000 // Give 5,000 PKR simulated sign-up bonus!
      },
      otp,
      expiresAt
    });

    // Send OTP via Email
    const emailResult = await sendRegistrationOtpEmail(email, otp);

    res.status(200).json({
      otpRequired: true,
      registrationId,
      message: 'Verification OTP sent to email.',
      previewUrl: emailResult.previewUrl || null
    });
  } catch (error) {
    console.error('Registration initiate error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// Verify Signup Registration (Step 2: Confirm OTP & Commit to DB)
router.post('/verify-registration', async (req, res) => {
  try {
    const { registrationId, otp } = req.body;

    if (!registrationId || !otp) {
      return res.status(400).json({ error: 'Registration ID and OTP are required' });
    }

    const pending = pendingRegistrations.get(registrationId);
    if (!pending) {
      return res.status(400).json({ error: 'Registration session not found. Please register again.' });
    }

    if (pending.expiresAt < Date.now()) {
      pendingRegistrations.delete(registrationId);
      return res.status(400).json({ error: 'OTP has expired. Please register again.' });
    }

    if (pending.otp !== otp) {
      return res.status(400).json({ error: 'Invalid verification OTP code' });
    }

    // Create user in DB
    const { name, email, phone, password, role, serviceType, experience, walletBalance } = pending.userData;
    
    // Seed admin check
    const isSeedAdmin = email.toLowerCase() === 'admin@servio.com';
    const finalRole = isSeedAdmin ? 'admin' : role;

    const newUser = db.users.create({
      name,
      email,
      phone,
      password,
      role: finalRole,
      walletBalance
    });

    let providerProfile = null;
    if (finalRole === 'provider') {
      providerProfile = db.providers.create({
        userId: newUser.id,
        serviceType: serviceType || ['electrician'],
        isAvailable: false,
        location: {
          type: 'Point',
          coordinates: [67.0011, 24.8607] // Karachi default
        },
        rating: 4.8,
        totalJobs: 0,
        experience: Number(experience) || 0,
        xp: 0,
        level: 1,
        badge: 'Rookie',
        lastActive: new Date().toISOString()
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: newUser.id, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Clear verification cache
    pendingRegistrations.delete(registrationId);

    res.status(201).json({
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        profilePic: newUser.profilePic || null,
        walletBalance: newUser.walletBalance
      },
      providerProfile
    });
  } catch (error) {
    console.error('Registration verification error:', error);
    res.status(500).json({ error: 'Server error during registration verification' });
  }
});

// GET /api/auth/me - Validate current user token and retrieve fresh profile
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized. No session token provided.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = db.users.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized. User session not found.' });
    }

    let providerProfile = null;
    if (user.role === 'provider') {
      providerProfile = db.providers.findOne({ userId: user.id });
    }

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        profilePic: user.profilePic || null,
        walletBalance: user.walletBalance !== undefined ? user.walletBalance : 5000
      },
      providerProfile
    });
  } catch (error) {
    console.error('Session verify error:', error);
    res.status(401).json({ error: 'Session expired or invalid token' });
  }
});

// Login User
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = db.users.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    let providerProfile = null;
    if (user.role === 'provider') {
      providerProfile = db.providers.findOne({ userId: user.id });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        profilePic: user.profilePic || null,
        walletBalance: user.walletBalance !== undefined ? user.walletBalance : 5000
      },
      providerProfile
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// Add Simulated Funds to Wallet
router.post('/wallet/add-funds', async (req, res) => {
  try {
    const { userId, amount } = req.body;
    if (!userId || !amount || Number(amount) <= 0) {
      return res.status(400).json({ error: 'User ID and positive load amount are required' });
    }

    const user = db.users.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const currentBalance = user.walletBalance !== undefined ? user.walletBalance : 5000;
    const newBalance = currentBalance + Number(amount);

    db.users.findByIdAndUpdate(userId, { walletBalance: newBalance });

    // Record credit transaction in database
    db.transactions.create({
      userId,
      type: 'credit',
      amount: Number(amount),
      description: 'Simulated Wallet Top-up',
      date: new Date().toISOString()
    });

    res.json({
      success: true,
      walletBalance: newBalance
    });
  } catch (error) {
    console.error('Wallet add funds error:', error);
    res.status(500).json({ error: 'Server error adding funds' });
  }
});

// Withdraw Simulated Funds from Wallet to Account
router.post('/wallet/withdraw', async (req, res) => {
  try {
    const { userId, amount, accountType, accountNumber } = req.body;
    if (!userId || !amount || Number(amount) <= 0 || !accountType || !accountNumber) {
      return res.status(400).json({ error: 'All fields (userId, amount, accountType, accountNumber) are required.' });
    }

    const user = db.users.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const currentBalance = user.walletBalance !== undefined ? user.walletBalance : 5000;
    if (currentBalance < Number(amount)) {
      return res.status(400).json({ error: 'Insufficient wallet balance for withdrawal.' });
    }

    const newBalance = currentBalance - Number(amount);
    db.users.findByIdAndUpdate(userId, { walletBalance: newBalance });

    // Record debit transaction in database
    db.transactions.create({
      userId,
      type: 'debit',
      amount: Number(amount),
      description: `Withdrawal to ${accountType} (${accountNumber})`,
      date: new Date().toISOString()
    });

    res.json({
      success: true,
      walletBalance: newBalance,
      message: `Successfully withdrew ${amount} PKR to your ${accountType}!`
    });
  } catch (error) {
    console.error('Wallet withdraw error:', error);
    res.status(500).json({ error: 'Server error during withdrawal' });
  }
});

// Update User Profile (profilePic, name, phone)
router.post('/update-profile', async (req, res) => {
  try {
    const { userId, name, phone, profilePic, role, serviceType } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const user = db.users.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updatedFields = {
      name: name || user.name,
      phone: phone || user.phone,
      profilePic: profilePic !== undefined ? profilePic : user.profilePic
    };

    if (role && role !== user.role) {
      updatedFields.role = role;
    }

    const updatedUser = db.users.findByIdAndUpdate(userId, updatedFields);
    let providerProfile = db.providers.findOne({ userId });

    if (updatedUser.role === 'provider' && !providerProfile) {
      providerProfile = db.providers.create({
        userId: updatedUser.id,
        serviceType: serviceType || ['AC mechanic'],
        isAvailable: false,
        location: {
          type: 'Point',
          coordinates: [0, 0]
        },
        totalJobs: 0,
        reviews: [],
        xp: 0,
        level: 1,
        badge: 'Rookie'
      });
    }

    if (updatedUser.role === 'provider' && providerProfile && serviceType) {
      providerProfile = db.providers.findByIdAndUpdate(providerProfile.id, {
        serviceType
      });
    }

    res.json({
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        profilePic: updatedUser.profilePic || null
      },
      providerProfile: providerProfile || null
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Server error during profile update' });
  }
});

// Request Password Reset OTP
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = db.users.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'User with this email does not exist' });
    }

    // Generate a 6-digit numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = Date.now() + 10 * 60 * 1000; // 10 minutes from now

    // Save to user document
    db.users.findByIdAndUpdate(user.id, {
      resetOtp: otp,
      resetOtpExpires: expires
    });

    // Send OTP via Email service
    const emailResult = await sendResetOtpEmail(email, otp);

    if (emailResult.success) {
      res.json({
        message: 'A 6-digit OTP code has been generated and sent to your email address.',
        previewUrl: emailResult.previewUrl || null
      });
    } else {
      res.json({
        message: `OTP generated! (Gmail SMTP failed: ${emailResult.error}). Please retrieve the OTP code from your backend command prompt / terminal.`
      });
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: error.message || 'Server error during password reset request' });
  }
});

// Reset Password with OTP Verification
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword, confirmPassword } = req.body;

    if (!email || !otp || !newPassword || !confirmPassword) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    // Password complexity validation: at least 1 numeric character and 1 special character
    const hasNumber = /[0-9]/.test(newPassword);
    const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);
    if (!hasNumber || !hasSpecial) {
      return res.status(400).json({ 
        error: 'Password must contain at least one numeric character and one special character (e.g. @, $, !, %, etc.)' 
      });
    }

    const user = db.users.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    // Validate OTP
    if (!user.resetOtp || user.resetOtp !== otp || !user.resetOtpExpires || user.resetOtpExpires < Date.now()) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password and clear OTP
    db.users.findByIdAndUpdate(user.id, {
      password: hashedPassword,
      resetOtp: null,
      resetOtpExpires: null
    });

    res.json({ success: true, message: 'Password reset successful! You can now log in.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Server error during password reset' });
  }
});

export default router;

