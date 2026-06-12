# 🔐 Super Admin Setup Guide

## ✅ Configuration Done

Your backend `.env` file has been updated with:
```
ADMIN_EMAIL=worldwideme523@gmail.com
EMAIL_USER=worldwideme523@gmail.com
EMAIL_PASS=Newthings(@)2025
```

---

## 🚀 Create Super Admin Account

### Step 1: Navigate to Backend Directory
```bash
cd Backend
```

### Step 2: Run the Super Admin Creation Script
```bash
npm run create-superadmin
```

### Expected Output:
```
✅ MongoDB connected
✅ Super Admin Account Created Successfully!
═══════════════════════════════════════════
Email:    worldwideme523@gmail.com
Password: Newthings(@)2025
Role:     Super Admin
═══════════════════════════════════════════

🌐 Login at: http://localhost:5174/admin-login
```

---

## 🔑 Login Credentials

| Field | Value |
|-------|-------|
| **Email** | worldwideme523@gmail.com |
| **Password** | Newthings(@)2025 |
| **Role** | Super Admin |

---

## 📋 What This Script Does

1. ✅ Connects to your MongoDB database
2. ✅ Checks if super admin already exists
3. ✅ Hashes the password securely with bcryptjs
4. ✅ Creates a new super admin user account
5. ✅ Closes the database connection

---

## 🔓 Login to Admin Panel

### Method 1: Using Admin-Specific Login
1. Start your frontend: `npm run dev` (in Frontend folder)
2. Open http://localhost:5174/admin-login
3. Enter:
   - Email: `worldwideme523@gmail.com`
   - Password: `Newthings(@)2025`
4. Click "Login"

### Method 2: Using Regular Login
1. Go to http://localhost:5174/login
2. Use same credentials
3. It will auto-detect your role and redirect to admin panel

---

## 👮 Super Admin Permissions

As a super admin, you can:

✅ **User Management**
- View all users
- Delete user accounts (except other super admins)
- Add funds to user wallets

✅ **Loan Management**
- View all loan applications
- Approve loans
- Deny loans
- Check loan details

✅ **Repayment Management**
- View all repayment requests
- Mark repayments as received
- Track payment status

✅ **Admin Management**
- Create new admin accounts
- Manage admin roles

---

## 🧪 Test Your Setup

### Step 1: Make sure backend is running
```bash
cd Backend
npm run dev
```
Should show: `Server running on port 5000`

### Step 2: Create super admin (in new terminal)
```bash
cd Backend
npm run create-superadmin
```
Should show success message with credentials

### Step 3: Start frontend (in new terminal)
```bash
cd Frontend
npm run dev
```
Should show: `Running at http://localhost:5174`

### Step 4: Login
1. Visit http://localhost:5174/admin-login
2. Enter your credentials
3. You should see the Admin Dashboard

---

## ⚠️ If Super Admin Already Exists

If you get this message:
```
⚠️  Super Admin already exists with email: worldwideme523@gmail.com
```

You can still login using the credentials. If you forgot the password, you can:

1. **Delete from MongoDB (Advanced)**
   ```javascript
   // Use MongoDB Compass or mongosh
   db.users.deleteOne({ email: 'worldwideme523@gmail.com' })
   ```
2. Run the script again

OR

2. **Use an Alternative Email**
   - Edit the script to use a different email
   - Run the script again

---

## 🛡️ Security Notes

⚠️ **Important:**
- Change the `JWT_SECRET` in `.env` to something secure (currently placeholder)
- Use strong passwords for production
- Never commit real credentials to git
- Use environment variables for sensitive data

---

## 🚀 Next Steps

1. ✅ Create super admin account (run script)
2. ✅ Login to admin panel
3. ✅ Create more admin accounts as needed
4. ✅ Test admin features
5. ✅ Deploy to production

---

## 📞 Troubleshooting

### Script fails to connect to MongoDB
**Solution:**
- Check your MongoDB connection string in `.env`
- Ensure MongoDB cluster is accessible
- Verify network access in MongoDB Atlas

### Can't login after creating admin
**Solution:**
- Clear browser cache and localStorage
- Check that backend server is running
- Check browser console for errors

### "User already exists" message
**Solution:**
- This is normal if you run the script twice
- You can now use the existing credentials
- Clear the user from DB if you need to recreate

---

## 📝 Account Details

Your super admin account will have:
- ✅ Full access to admin panel
- ✅ Ability to manage all users
- ✅ Ability to approve/deny loans
- ✅ Ability to manage admins
- ✅ Access to all reports and analytics

---

**Ready to manage your platform!** 🎉

For issues, check the troubleshooting section or review the logs in your terminal.
