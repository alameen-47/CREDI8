import express from 'express';
import {
  AddCustomer,
  DeleteCustomer,
  EditCustomer,
  FetchAllCustomer,
  getTwiml,
  makeBulkCalls,
  SearchController,
  sendBulkWhatsappMessages,
} from '../controllers/customerController.js';

const router = express.Router();

//CUSTOMER config

router.get('/all-customers', FetchAllCustomer);

router.post('/add-customer', AddCustomer);

router.put('/edit-customer', EditCustomer);

// Route to handle search requests
router.get('/search', SearchController);

router.delete('/delete/:id', DeleteCustomer);

// Route to send Whatsapp Messages to all
router.post('/send-whatsapp-messages', sendBulkWhatsappMessages);
export default router;

//route to initiate calls to all
router.post('/make-call', makeBulkCalls);
//route for the voice file located in the controller file
router.get('/twiml-voice', getTwiml);
