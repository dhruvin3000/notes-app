const express = require('express');
const bcrypt = require('bcryptjs');
const supabase = require('../config/supabase');
const {
    generateToken
} = require('../utils/jwt');

const router = express.Router();

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', async (req, res) => {
    const {
        username,
        email,
        password
    } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({
            success: false,
            error: 'Please provide username, email and password'
        });
    }

    if (password.length < 6) {
        return res.status(400).json({
            success: false,
            error: 'Password must be at least 6 characters'
        });
    }

    try {
        // Check if email already exists
        const {
            data: existing
        } = await supabase
            .from('users')
            .select('id')
            .eq('email', email)
            .single();

        if (existing) {
            return res.status(400).json({
                success: false,
                error: 'Email already registered'
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert user into Supabase
        const {
            data: user,
            error
        } = await supabase
            .from('users')
            .insert([{
                username,
                email,
                password: hashedPassword
            }])
            .select('id, username, email, created_at')
            .single();

        if (error) {
            console.error('Supabase insert error:', error.message);
            return res.status(500).json({
                success: false,
                error: 'Failed to create user'
            });
        }

        const token = generateToken(user.id);

        res.status(201).json({
            success: true,
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                created_at: user.created_at,
            },
        });
    } catch (err) {
        console.error('Register error:', err.message);
        res.status(500).json({
            success: false,
            error: 'Server error during registration'
        });
    }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
    const {
        email,
        password
    } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            error: 'Please provide email and password'
        });
    }

    try {
        // Fetch user including password hash
        const {
            data: user,
            error
        } = await supabase
            .from('users')
            .select('id, username, email, password, created_at')
            .eq('email', email)
            .single();

        if (error || !user) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }

        const token = generateToken(user.id);

        res.status(200).json({
            success: true,
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                created_at: user.created_at,
            },
        });
    } catch (err) {
        console.error('Login error:', err.message);
        res.status(500).json({
            success: false,
            error: 'Server error during login'
        });
    }
});

// @desc    Get current logged-in user
// @route   GET /api/auth/me
// @access  Private
const {
    protect
} = require('../middleware/protect');
router.get('/me', protect, (req, res) => {
    res.status(200).json({
        success: true,
        user: req.user
    });
});

module.exports = router;