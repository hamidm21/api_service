const express = require('express');
const router = express.Router();
const controller = require('../lib/controllers/user_controller');
const multer = require('multer');
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, '/tmp/my-uploads');
	},
	filename: function (req, file, cb) {
		cb(null, file.fieldname + '-' + Date.now());
	}
});   
const upload = multer({ storage: storage });

router.post('/extraInfo', controller.extraInfo);

router.post('/getProfile', controller.getProfile);

router.get('/getPsychologistsList', controller.getPsychologistsList);

// router.post('/getClipboard', controller.getClipboard);

// router.post('saveClipboard', controller.saveClipboard);

router.post('/editUsername', controller.editUsername);

router.post('/editProfilePicture', upload.single('avatar'), controller.editProfilePicture);

router.post('/editPhoneNumber', controller.editPhoneNumber);

router.post('/editPasssword', controller.editPassword);

// router.post('/editSpecificInfo', controller.editSpecificInfo);

router.post('/registerWithType', controller.registerWithType);

module.exports = router;