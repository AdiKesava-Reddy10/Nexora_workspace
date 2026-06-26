const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const userRepository = require('../repositories/userRepository');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'nexora_workspace_secret_key_2026_secure';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

const authController = {
  // Register new account
  async register(req, res) {
    try {
      const { email, password, name, phone, profession, organization, skills, bio, avatar, role } = req.body;

      if (!email || !password || !name) {
        return res.status(400).json({
          success: false,
          message: 'Missing required parameters: email, password, and name are required.'
        });
      }

      // Check if user exists
      const existingUser = await userRepository.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'An account with this email address already exists.'
        });
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 10);

      // Create user
      const newUser = await userRepository.create({
        name,
        email: email.toLowerCase(),
        password: passwordHash,
        phone: phone || '',
        profession: profession || 'Developer',
        organization: organization || '',
        skills: skills || '',
        bio: bio || '',
        avatar: avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150', // placeholder avatar
        role: role || 'Developer',
        status: 'Online',
        verified: true, // Defaulting true to bypass live SMTP setup friction
        otpCode: null
      });

      // Sign JWT Token
      const token = jwt.sign(
        { id: newUser.id, email: newUser.email, role: newUser.role },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      // Remove password hash from response
      delete newUser.password;

      return res.status(201).json({
        success: true,
        message: 'Account created successfully.',
        token,
        user: newUser
      });
    } catch (error) {
      console.error('Registration Controller Error:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Internal server error during registration.'
      });
    }
  },

  // Login session
  async login(req, res) {
    try {
      const { email, password, rememberMe } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email and password are required.'
        });
      }

      const user = await userRepository.findByEmail(email);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials. User not found.'
        });
      }

      // Check password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials. Password does not match.'
        });
      }

      // Update status to Online
      const updatedUser = await userRepository.update(user.id, { status: 'Online' });

      // Expiry duration based on Remember Me
      const expiresIn = rememberMe ? '30d' : JWT_EXPIRES_IN;

      // Sign JWT Token
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn }
      );

      delete updatedUser.password;

      return res.status(200).json({
        success: true,
        message: 'Login successful.',
        token,
        user: updatedUser
      });
    } catch (error) {
      console.error('Login Controller Error:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Internal server error during login.'
      });
    }
  },

  // Logout session
  async logout(req, res) {
    try {
      if (req.user) {
        await userRepository.update(req.user.id, { status: 'Offline' });
      }
      return res.status(200).json({
        success: true,
        message: 'Logged out successfully.'
      });
    } catch (error) {
      console.error('Logout Controller Error:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Internal server error during logout.'
      });
    }
  },

  // Get current user profile
  async getProfile(req, res) {
    try {
      const user = await userRepository.findById(req.user.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User profile not found.'
        });
      }
      delete user.password;
      return res.status(200).json({
        success: true,
        user
      });
    } catch (error) {
      console.error('Profile Controller Error:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Internal server error fetching profile.'
      });
    }
  },

  // Update profile
  async updateProfile(req, res) {
    try {
      const { name, phone, profession, organization, skills, bio, avatar, oldPassword, newPassword } = req.body;
      const user = await userRepository.findById(req.user.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found.'
        });
      }

      const updateData = {
        name: name || user.name,
        phone: phone !== undefined ? phone : user.phone,
        profession: profession || user.profession,
        organization: organization !== undefined ? organization : user.organization,
        skills: skills !== undefined ? skills : user.skills,
        bio: bio !== undefined ? bio : user.bio,
        avatar: avatar || user.avatar
      };

      // Password change logic
      if (newPassword) {
        if (!oldPassword) {
          return res.status(400).json({
            success: false,
            message: 'You must provide your current password to set a new password.'
          });
        }
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
          return res.status(400).json({
            success: false,
            message: 'Incorrect current password.'
          });
        }
        updateData.password = await bcrypt.hash(newPassword, 10);
      }

      const updatedUser = await userRepository.update(req.user.id, updateData);
      delete updatedUser.password;

      return res.status(200).json({
        success: true,
        message: 'Profile updated successfully.',
        user: updatedUser
      });
    } catch (error) {
      console.error('Profile Update Controller Error:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Internal server error updating profile.'
      });
    }
  }
};

module.exports = authController;
