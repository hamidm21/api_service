const Room = require('../dao/room_dao').Room;
const User = require('../dao/user_dao').User;
const Message = require('../dao/chat_dao').Message;
const validator = require('../utils/validator');
const mongo_log = require('debug')('goftare:mongo');

exports.createRoom = async (req, res, next) => {
	const {
		user_id
	} = req.body;
	try {
		const psychologist = await User.findPsychologist();
		const user = await User.findUserById(user_id);
		const psychologist_id = psychologist._id;
		const valid = validator.joi.validate({
			user_id,
			psychologist_id
		}, validator.createRoom);
		if (valid.error) {
			res.json(Object.assign({}, req.base, {
				result: false,
				message: 'input is not valid',
				data: valid.error
			}));
		} else {
			const members = [{user_id, username: user.username, avatar: user.avatar}, {user_id: psychologist_id, username: psychologist.username, avatar: psychologist.avatar}];
			const saved = await Room.createRoom(psychologist_id, user_id, members, user_id, psychologist_id);
			mongo_log(saved);
			res.json(Object.assign({}, req.base, {
				message: 'room created',
				data: {
					_id: saved._id,
					members
				}
			}));
		}
	} catch (e) {
		next(new Error(`Error in create room controller ${e}`));
	}
};


exports.getRooms = async (req, res, next) => {
	const {
		user_id
	} = req.body;
	try {
		const valid = validator.joi.validate({
			user_id
		}, validator.getRooms);
		if(valid.error){
			res.json(Object.assign({}, req.base, {
				result: false,
				message: 'input is not valid',
				data: valid.error
			}));
		}else{
			const rooms = await Room.getRooms(user_id);
			for(const room of rooms) {
				const unreadMessages = await Message.getUnreadMessagesById(room._id);
				const lastMessage = await Message.getLastMessage(room._id);
				Object.assign(room, {unreadMessages, lastMessage});
			}
			mongo_log(rooms);
			res.json(Object.assign({}, req.base, {
				message: 'got rooms',
				data: rooms
			}));	
		}
	} catch (e) {
		mongo_log(e);
		next(new Error(`Error in get rooms controller ${e}`));
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