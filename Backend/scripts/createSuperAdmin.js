// import mongoose from 'mongoose';
// import bcrypt from 'bcryptjs';
// import dotenv from 'dotenv';
// import User from './models/User.js';

// dotenv.config();

// const createSuperAdmin = async () => {
//   try {
//     // Connect to MongoDB
//     console.log('Connecting to MongoDB...');
//     await mongoose.connect(process.env.MONGODB_URI);
//     console.log('✅ MongoDB connected');

//     // Check if super admin already exists
//     const existingAdmin = await User.findOne({ email: 'worldwideme523@gmail.com' });
//     if (existingAdmin) {
//       console.log('⚠️  Super admin already exists with email: worldwideme523@gmail.com');
//       console.log('Login Email:', existingAdmin.email);
//       console.log('Role:', existingAdmin.role);
//       console.log('\nYou can now login at: http://localhost:5174/admin-login');
//       await mongoose.connection.close();
//       return;
//     }

//     // Hash the password
//     const hashedPassword = await bcrypt.hash('Newthings(@)2025', 10);

//     // Create super admin user
//     const superAdmin = new User({
//       name: 'Super Admin',
//       email: 'worldwideme523@gmail.com',
//       password: hashedPassword,
//       phone: '+234 (Super Admin)',
//       houseAddress: 'Admin Office',
//       officeAddress: 'Admin Office',
//       role: 'superadmin',
//       walletBalance: 0,
//       externalWalletAddress: ''
//     });

//     await superAdmin.save();

//     console.log('\n✅ Super Admin Account Created Successfully!');
//     console.log('═══════════════════════════════════════════');
//     console.log('Email:    worldwideme523@gmail.com');
//     console.log('Password: Newthings(@)2025');
//     console.log('Role:     Super Admin');
//     console.log('═══════════════════════════════════════════');
//     console.log('\n🌐 Login at: http://localhost:5174/admin-login');
//     console.log('\n✨ You can now:');
//     console.log('   • Approve/Deny loan applications');
//     console.log('   • Add funds to user wallets');
//     console.log('   • View all users');
//     console.log('   • View repayment requests');
//     console.log('   • Create new admin accounts');
//     console.log('   • Delete user accounts');

//     await mongoose.connection.close();
//     console.log('\n✅ Database connection closed');
//   } catch (error) {
//     console.error('❌ Error creating super admin:', error.message);
//     process.exit(1);
//   }
// };

// createSuperAdmin();
