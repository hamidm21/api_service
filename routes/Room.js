const express = require('express');
const router = express.Router();
const controller = require('../lib/controllers/room_controller');
const guard = require('../lib/utils/guard');


router.post('/createRoom' , controller.createRoom);

router.post('/getRooms'  , controller.getRooms);


// router.post('/createPsychologist' , controller.createPsychologist);

module.exports = router;