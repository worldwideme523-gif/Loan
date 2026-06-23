import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { sendEmail } from '../utils/emailService.js';

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

    try {
      await sendEmail({
        to: user.email,
        subject: 'Welcome to FoyerLibre!',
        html: `
          <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; border-radius: 16px; overflow: hidden;">
            <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #06b6d4 100%); padding: 32px; text-align: center;">
              <div style="font-size: 48px; margin-bottom: 8px;">🏡</div>
              <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 700;">Welcome to FoyerLibre!</h1>
              <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0; font-size: 14px;">Your financial journey starts here</p>
            </div>
            <div style="padding: 32px;">
              <p style="color: #0f172a; font-size: 16px; line-height: 1.6;">Dear ${user.name},</p>
              <p style="color: #475569; font-size: 14px; line-height: 1.6;">Thank you for creating an account with <strong>FoyerLibre</strong>. We're excited to help you achieve your financial goals.</p>
              <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 20px; margin: 20px 0;">
                <p style="color: #1e40af; font-size: 14px; font-weight: 600; margin: 0 0 12px;">What you can do now:</p>
                <ul style="color: #475569; font-size: 14px; line-height: 1.8; padding-left: 20px; margin: 0;">
                  <li>Browse loan options from $100,000 to $20,000,000</li>
                  <li>Use our loan calculator to plan your repayment</li>
                  <li>Apply for a loan in just a few clicks</li>
                  <li>Track your application status in real-time</li>
                </ul>
              </div>
              <p style="color: #475569; font-size: 14px; line-height: 1.6;">If you have any questions, our support team is available 24/7 to assist you.</p>
              <div style="text-align: center; margin-top: 24px;">
                <a href="${process.env.FRONTEND_URL || 'https://foyerlibre.com'}/dashboard" style="display: inline-block; background: linear-gradient(135deg, #1e40af, #3b82f6); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-size: 15px; font-weight: 600; box-shadow: 0 4px 14px rgba(59,130,246,0.4);">Go to Dashboard</a>
              </div>
              <p style="color: #94a3b8; font-size: 12px; margin-top: 24px; text-align: center;">Best regards,<br/>The FoyerLibre Team</p>
            </div>
          </div>
        `
      });
    } catch (emailError) {
      console.error('Welcome email failed:', emailError.message);
    }

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