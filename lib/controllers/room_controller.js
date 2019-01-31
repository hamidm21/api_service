const Room = require('../dao/room_dao').Room;
const Psycho = require('../dao/psychologist_dao').Psycho;
const Auth = require('../dao/auth_dao').Auth;
const validator = require('../utils/validator');
const mongo_log = require('debug')('goftare:mongo');

exports.createRoom = async (req, res, next) => {
	const {
		user_id
	} = req.body;
	try {
		const psychologist_id = '5c45b0dfbb26b9435e4c2b8b';
		const valid = validator.joi.validate({
			user_id: user_id,
			psychologist_id: psychologist_id
		}, validator.createRoom);
		if (valid.error) {
			res.json(Object.assign(req.base, {
				result: false,
				message: 'input is not valid',
				data: valid.error
			}));
		} else {
			const saved = await Room.createRoom(psychologist_id, user_id);
			mongo_log(saved);
			res.json(Object.assign(req.base, {
				message: 'room created',
				data: {
					room_id: saved._id,
					psychologist_id
				}
			}));
		}
	} catch (e) {
		next(new Error(`Error in create room controller ${e}`));
	}
};


exports.getRooms = async (req, res, next) => {
	const {
		id
	} = req.body;
	try {
		const rooms = await Room.getRooms(id);
		mongo_log(rooms);
		res.json(Object.assign(req.base, {
			message: 'got rooms',
			data: rooms
		}));

	} catch (e) {
		next(new Error(`Error in create room controller ${e}`));
	}
};

// exports.createPsychologist = async function(req, res, next){
// 	const {username, email, password} = req.body;
// 	try{
// 		const auth = await Auth.saveAuth(email, password);
// 		const psycho = await Psycho.savePscyhologist(email, username);

// 		if(auth && psycho){
// 			res.json({result: true});
// 		}else
// 			res.json({result: false});

// 	}catch(e){
// 		next(new Error(`Error in create psychologist controller ${e}`));
// 	}
// }