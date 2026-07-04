import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Provider from '../models/Provider.js';
import Transaction from '../models/Transaction.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'abhi_kaun_free_hai_secret_key_123';

// Register User and create account directly without OTP verification
router.post('/register', async (req, res) => {
  try {
    let { name, email, phone, password, confirmPassword, role, serviceType, experience } = req.body;

    name = name ? name.trim() : '';
    email = email ? email.trim().toLowerCase() : '';
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

    // Check if user already exists in MongoDB
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const isSeedAdmin = email.toLowerCase() === 'admin@servio.com';
    const finalRole = isSeedAdmin ? 'admin' : role;

    const newUser = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      role: finalRole,
      walletBalance: 5000
    });

    let providerProfile = null;
    if (finalRole === 'provider') {
      providerProfile = await Provider.create({
        userId: newUser._id.toString(),
        serviceType: Array.isArray(serviceType) ? serviceType : [serviceType || 'electrician'],
        isAvailable: false,
        location: {
          type: 'Point',
          coordinates: [67.0011, 24.8607]
        },
        rating: 4.8,
        totalJobs: 0,
        experience: Number(experience) || 0,
        xp: 0,
        level: 1,
        badge: 'Rookie',
        lastActive: new Date()
      });
    }

    const token = jwt.sign(
      { userId: newUser._id.toString(), role: newUser.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: newUser._id.toString(),
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        profilePic: newUser.profilePic || null,
        walletBalance: newUser.walletBalance
      },
      providerProfile: providerProfile ? {
        id: providerProfile._id.toString(),
        userId: providerProfile.userId,
        serviceType: providerProfile.serviceType,
        isAvailable: providerProfile.isAvailable,
        rating: providerProfile.rating,
        totalJobs: providerProfile.totalJobs,
        experience: providerProfile.experience,
        xp: providerProfile.xp,
        level: providerProfile.level,
        badge: providerProfile.badge
      } : null
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// Verify Signup Registration (Step 2: Confirm OTP & Commit to MongoDB)
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

    const { name, email, phone, password, role, serviceType, experience, walletBalance } = pending.userData;

    // Seed admin check
    const isSeedAdmin = email.toLowerCase() === 'admin@servio.com';
    const finalRole = isSeedAdmin ? 'admin' : role;

    // Create user in MongoDB
    const newUser = await User.create({
      name,
      email,
      phone,
      password,
      role: finalRole,
      walletBalance
    });

    let providerProfile = null;
    if (finalRole === 'provider') {
      providerProfile = await Provider.create({
        userId: newUser._id.toString(),
        serviceType: Array.isArray(serviceType) ? serviceType : [serviceType || 'electrician'],
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
        lastActive: new Date()
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: newUser._id.toString(), role: newUser.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Clear verification cache
    pendingRegistrations.delete(registrationId);

    res.status(201).json({
      token,
      user: {
        id: newUser._id.toString(),
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        profilePic: newUser.profilePic || null,
        walletBalance: newUser.walletBalance
      },
      providerProfile: providerProfile ? {
        id: providerProfile._id.toString(),
        userId: providerProfile.userId,
        serviceType: providerProfile.serviceType,
        isAvailable: providerProfile.isAvailable,
        rating: providerProfile.rating,
        totalJobs: providerProfile.totalJobs,
        experience: providerProfile.experience,
        xp: providerProfile.xp,
        level: providerProfile.level,
        badge: providerProfile.badge
      } : null
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

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized. User session not found.' });
    }

    let providerProfile = null;
    if (user.role === 'provider') {
      const pDoc = await Provider.findOne({ userId: user._id.toString() });
      if (pDoc) {
        providerProfile = {
          id: pDoc._id.toString(),
          userId: pDoc.userId,
          serviceType: pDoc.serviceType,
          isAvailable: pDoc.isAvailable,
          rating: pDoc.rating,
          totalJobs: pDoc.totalJobs,
          experience: pDoc.experience,
          xp: pDoc.xp,
          level: pDoc.level,
          badge: pDoc.badge,
          location: pDoc.location
        };
      }
    }

    res.json({
      user: {
        id: user._id.toString(),
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

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    let providerProfile = null;
    if (user.role === 'provider') {
      const pDoc = await Provider.findOne({ userId: user._id.toString() });
      if (pDoc) {
        providerProfile = {
          id: pDoc._id.toString(),
          userId: pDoc.userId,
          serviceType: pDoc.serviceType,
          isAvailable: pDoc.isAvailable,
          rating: pDoc.rating,
          totalJobs: pDoc.totalJobs,
          experience: pDoc.experience,
          xp: pDoc.xp,
          level: pDoc.level,
          badge: pDoc.badge,
          location: pDoc.location
        };
      }
    }

    const token = jwt.sign(
      { userId: user._id.toString(), role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id.toString(),
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

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const currentBalance = user.walletBalance !== undefined ? user.walletBalance : 5000;
    const newBalance = currentBalance + Number(amount);

    await User.findByIdAndUpdate(userId, { walletBalance: newBalance });

    // Record credit transaction in database
    await Transaction.create({
      userId,
      type: 'credit',
      amount: Number(amount),
      description: 'Simulated Wallet Top-up',
      date: new Date()
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

// Withdraw Simulated Funds from Wallet
router.post('/wallet/withdraw', async (req, res) => {
  try {
    const { userId, amount, accountType, accountNumber } = req.body;
    if (!userId || !amount || Number(amount) <= 0 || !accountType || !accountNumber) {
      return res.status(400).json({ error: 'All fields (userId, amount, accountType, accountNumber) are required.' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const currentBalance = user.walletBalance !== undefined ? user.walletBalance : 5000;
    if (currentBalance < Number(amount)) {
      return res.status(400).json({ error: 'Insufficient wallet balance for withdrawal.' });
    }

    const newBalance = currentBalance - Number(amount);
    await User.findByIdAndUpdate(userId, { walletBalance: newBalance });

    // Record debit transaction
    await Transaction.create({
      userId,
      type: 'debit',
      amount: Number(amount),
      description: `Withdrawal to ${accountType} (${accountNumber})`,
      date: new Date()
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

    const user = await User.findById(userId);
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

    const updatedUser = await User.findByIdAndUpdate(userId, updatedFields, { new: true });
    let providerProfile = await Provider.findOne({ userId });

    if (updatedUser.role === 'provider' && !providerProfile) {
      providerProfile = await Provider.create({
        userId: updatedUser._id.toString(),
        serviceType: Array.isArray(serviceType) ? serviceType : [serviceType || 'AC mechanic'],
        isAvailable: false,
        location: { type: 'Point', coordinates: [0, 0] },
        totalJobs: 0,
        reviews: [],
        xp: 0,
        level: 1,
        badge: 'Rookie'
      });
    }

    if (updatedUser.role === 'provider' && providerProfile && serviceType) {
      providerProfile = await Provider.findByIdAndUpdate(
        providerProfile._id,
        { serviceType: Array.isArray(serviceType) ? serviceType : [serviceType] },
        { new: true }
      );
    }

    res.json({
      user: {
        id: updatedUser._id.toString(),
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        profilePic: updatedUser.profilePic || null
      },
      providerProfile: providerProfile ? {
        id: providerProfile._id.toString(),
        userId: providerProfile.userId,
        serviceType: providerProfile.serviceType,
        isAvailable: providerProfile.isAvailable,
        rating: providerProfile.rating,
        totalJobs: providerProfile.totalJobs,
        experience: providerProfile.experience
      } : null
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

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      return res.status(400).json({ error: 'User with this email does not exist' });
    }

    // Generate a 6-digit numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = Date.now() + 10 * 60 * 1000; // 10 minutes from now

    await User.findByIdAndUpdate(user._id, {
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

    const hasNumber = /[0-9]/.test(newPassword);
    const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);
    if (!hasNumber || !hasSpecial) {
      return res.status(400).json({ 
        error: 'Password must contain at least one numeric character and one special character (e.g. @, $, !, %, etc.)' 
      });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    if (!user.resetOtp || user.resetOtp !== otp || !user.resetOtpExpires || user.resetOtpExpires < Date.now()) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await User.findByIdAndUpdate(user._id, {
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
