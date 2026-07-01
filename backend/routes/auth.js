import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../config/db.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'abhi_kaun_free_hai_secret_key_123';

// Register User
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password, role, serviceType } = req.body;

    if (!name || !email || !phone || !password || !role) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Password restriction: at least 1 numeric character and 1 special character
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);
    if (!hasNumber || !hasSpecial) {
      return res.status(400).json({ 
        error: 'Password must contain at least one numeric character and one special character (e.g. @, $, !, %, etc.)' 
      });
    }

    // Check if user already exists
    const existingUser = db.users.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const newUser = db.users.create({
      name,
      email,
      phone,
      password: hashedPassword,
      role
    });

    let providerProfile = null;

    // If role is provider, create a provider profile
    if (role === 'provider') {
      providerProfile = db.providers.create({
        userId: newUser.id,
        serviceType: serviceType || ['electrician'], // Array of services
        isAvailable: false,
        location: {
          type: 'Point',
          coordinates: [67.0011, 24.8607] // Default Karachi coordinates [lng, lat]
        },
        rating: 4.8,
        totalJobs: 0,
        lastActive: new Date().toISOString()
      });
    }

    // Generate token
    const token = jwt.sign(
      { userId: newUser.id, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        profilePic: newUser.profilePic || null
      },
      providerProfile
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error during registration' });
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
        profilePic: user.profilePic || null
      },
      providerProfile
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
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
        reviews: []
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

export default router;
