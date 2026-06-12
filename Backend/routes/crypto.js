import express from 'express';
import { getCryptoPrices } from '../controller/cryptoController.js';

const router = express.Router();

router.get('/prices', getCryptoPrices);

export default router;