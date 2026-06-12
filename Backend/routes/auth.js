import express from 'express';
import { upload } from '../middleware/upload.js';
import { validateRegister } from '../middleware/validation.js';
import { register, login, setupSuperAdmin, adminExists } from '../controller/authController.js';

const router = express.Router();

router.post(
  '/register',
  upload.fields([
    { name: 'dobCertificate', maxCount: 1 },
    { name: 'driversLicense', maxCount: 1 },
    { name: 'passport', maxCount: 1 }
  ]),
  validateRegister,
  register
);

router.post('/login', login);
router.get('/admin-exists', adminExists);

// Super admin setup (only if no admin exists)
router.post('/setup-superadmin', setupSuperAdmin);

export default router;