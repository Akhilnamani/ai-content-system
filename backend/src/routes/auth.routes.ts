import express, { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { User } from '../models/User';


const router: Router = express.Router();


// Register Route
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, password } = req.body;


    // Validate input
    if (!firstName || !lastName || !email || !password) {
      res.status(400).json({ message: 'All fields are required' });
      return;
    }


    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    // Create user
    const user = new User({
      firstName,
      lastName,
      email,
      password,
    });


    await user.save();


    // Generate JWT
    const secret = process.env.JWT_SECRET || 'your-secret-key';
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      secret,
      { expiresIn: '7d' }
    );


    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// Login Route
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    console.log('🔵 Login attempt:', { email, passwordLength: password?.length });


    // Validate input
    if (!email || !password) {
      console.log('❌ Missing credentials');
      res.status(400).json({ message: 'Email and password are required' });
      return;
    }


    // Find user
    const user = await User.findOne({ email });
    console.log('🔍 User found:', user ? 'YES' : 'NO');
    
    if (!user) {
      console.log('❌ User not found for email:', email);
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }


    // Check password with detailed debugging
    console.log('🔐 Stored hash:', user.password);
    console.log('🔐 Password input:', password);
    console.log('🔐 Password type:', typeof password);
    console.log('🔐 Password length:', password.length);
    console.log('🔐 Hash length:', user.password.length);

    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log('✅ Password valid:', isPasswordValid);
    
    if (!isPasswordValid) {
      console.log('❌ Password mismatch');
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }


    // Generate JWT
    const secret = process.env.JWT_SECRET || 'your-secret-key';
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      secret,
      { expiresIn: '7d' }
    );


    console.log('✅ Login successful for:', email);
    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ message: 'Internal server error', error: String(error) });
  }
});


export default router;
