const express = require('express');
const router = express.Router();
const controller = require('../lib/controllers/user_controller');

router.post('/extraInfo', controller.extraInfo);

router.post('/getProfile', controller.getProfile);

router.get('/getPsychologistsList', controller.getPsychologistsList);

module.exports = router;