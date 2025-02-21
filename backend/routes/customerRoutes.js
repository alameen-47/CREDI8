import express from 'express';
import {
  AddCustomer,
  DeleteCustomer,
  EditCustomer,
  FetchAllCustomer,
  SearchController,
} from '../controllers/customerController.js';

const router = express.Router();

//CUSTOMER config

router.get('/all-customers', FetchAllCustomer);

router.post('/add-customer', AddCustomer);

router.put('/edit-customer', EditCustomer);

// Route to handle search requests
router.get('/search', SearchController);

router.delete('/delete/:id', DeleteCustomer);

export default router;
