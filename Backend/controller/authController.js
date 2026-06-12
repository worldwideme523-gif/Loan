import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// @desc    Register a new user
export const register = async (req, res, next) => {
  try {
    const { name, email, password, phone, houseAddress, officeAddress } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      phone,
      houseAddress,
      officeAddress,
      documents: {
        dobCertificate: req.files?.dobCertificate ? req.files.dobCertificate[0].path : null,
        driversLicense: req.files?.driversLicense ? req.files.driversLicense[0].path : null,
        passport: req.files?.passport ? req.files.passport[0].path : null
      }
    });

    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        walletBalance: user.walletBalance
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Setup first super admin (only if no admin exists)
export const setupSuperAdmin = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

    const existingAdmin = await User.findOne({
      role: { $in: ['admin', 'superadmin'] }
    });

    if (existingAdmin) {
      return res.status(403).json({ message: 'An admin already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const superAdmin = new User({
      name,
      email,
      password: hashedPassword,
      phone,
      houseAddress: 'N/A',
      officeAddress: 'N/A',
      role: 'superadmin',
      walletBalance: 0
    });

    await superAdmin.save();

    const token = jwt.sign(
      { id: superAdmin._id, role: superAdmin.role },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.status(201).json({
      message: 'Super admin created successfully',
      token,
      user: {
        id: superAdmin._id,
        name: superAdmin.name,
        email: superAdmin.email,
        role: superAdmin.role
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Check if any admin exists
export const adminExists = async (req, res, next) => {
  try {
    const admin = await User.findOne({ role: { $in: ['admin', 'superadmin'] } });
    res.json({ exists: !!admin });
  } catch (error) {
    next(error);
  }
};