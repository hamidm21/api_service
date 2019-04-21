const express = require('express');
const router = express.Router();
const controller = require('../lib/controllers/chat_controller');

router.post('/getMessages', controller.getMessages);

router.post('/getPreperedMessage', controller.getPreparedMessage);

module.exports = router;