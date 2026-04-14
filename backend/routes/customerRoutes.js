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
import {handleCallStatusCallback} from '../controllers/callsController.js';
import {authMiddleware} from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/all-customers', authMiddleware, FetchAllCustomer);
router.post('/add-customer', authMiddleware, AddCustomer);
router.put('/edit-customer', authMiddleware, EditCustomer);
router.get('/search', authMiddleware, SearchController);
router.delete('/delete/:id', authMiddleware, DeleteCustomer);
router.post('/create-message', authMiddleware, createMessage);
router.post('/send-whatsapp-messages', authMiddleware, sendBulkWhatsappMessages);
router.post('/make-call', authMiddleware, makeBulkCalls);
router.get('/get-message', authMiddleware, getMesssge);

// Public endpoints — called by Twilio, not by the app
router.get('/twiml-voice', getTwiml);
router.post('/call-status', handleCallStatusCallback);

export default router;
