import express from 'express';
import {
  AddCustomer,
  createMessage,
  DeleteCustomer,
  EditCustomer,
  FetchAllCustomer,
  getMesssge,
  SearchController,
} from '../controllers/customerController.js';
import {
  getTwimlVoice,
  handleTwilioStatusCallback,
  makeBulkCalls,
} from '../controllers/twilioVoiceController.js';
import {authMiddleware} from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/all-customers', authMiddleware, FetchAllCustomer);
router.post('/add-customer', authMiddleware, AddCustomer);
router.put('/edit-customer', authMiddleware, EditCustomer);
router.get('/search', authMiddleware, SearchController);
router.delete('/delete/:id', authMiddleware, DeleteCustomer);
router.post('/create-message', authMiddleware, createMessage);
router.get('/get-message', authMiddleware, getMesssge);

// PSTN voice calling (Twilio)
router.post('/make-call', authMiddleware, makeBulkCalls);
router.get('/twiml-voice', getTwimlVoice);
router.post('/call-status', handleTwilioStatusCallback);

export default router;
