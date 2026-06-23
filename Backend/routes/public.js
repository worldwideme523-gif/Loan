import express from 'express';
import { visitorContact } from '../controller/publicController.js';

const router = express.Router();

router.post('/contact', visitorContact);

export default router;
