import express from 'express';

import {
  AddCustomer,
  createMessage,
  DeleteCustomer,
  EditCustomer,
  FetchAllCustomer,
  getMesssge,
  getTwiml,
  makeBulkCalls,
  SearchController,
  sendBulkWhatsappMessages,
} from '../controllers/customerController.js';
import {authMiddleware} from '../middlewares/authMiddleware.js';

const router = express.Router();

//CUSTOMER config

router.get('/all-customers', FetchAllCustomer);

router.post('/add-customer', AddCustomer);

router.put('/edit-customer', EditCustomer);

router.get('/protected', authMiddleware, (req, res) => {
  res.json({message: 'YOu are protected', user: req.user});
});

// Route to handle search requests
router.get('/search', SearchController);

router.delete('/delete/:id', DeleteCustomer);

router.post('/create-message', createMessage);
// Route to send Whatsapp Messages to all
router.post('/send-whatsapp-messages', sendBulkWhatsappMessages);
export default router;

//route to initiate calls to all
router.post('/make-call', makeBulkCalls);
//route for the voice file located in the controller file
router.get('/twiml-voice', getTwiml);

router.get('/get-message', getMesssge);
