const router = require('express').Router();
const controller = require('../lib/handlers/kafka_handler');

router.post('/createTopic', controller.createTopic);

module.exports = router;