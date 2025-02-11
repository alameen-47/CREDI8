import express from 'express';
import {
  AddCustomer,
  EditCustomer,
  SearchController,
} from '../controllers/customerController.js';
import customerModel from '../models/customerModel.js';

const router = express.Router();

//CUSTOMER config

router.post('/add-customer', AddCustomer);

router.put('/edit-customer', EditCustomer);

// Route to handle search requests
router.get('/search', SearchController);

export default router;
