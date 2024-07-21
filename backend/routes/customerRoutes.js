const express = require('express');
const {
  addCustomer,
  getCustomers,
} = require('../controllers/customerController');
const router = express.Router();

router.post('/add', addCustomer);
router.get('/list', getCustomers);

module.exports = router;
