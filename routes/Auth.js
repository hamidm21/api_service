const express = require('express');
const router = express.Router();
const controller = require('../lib/controllers/auth_controller');

router.post('/Register', controller.Register);

router.post('/Login', controller.Login);

router.post('/RefreshToken', controller.refreshToken);

module.exports = router;