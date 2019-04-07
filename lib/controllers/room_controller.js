const Room = require('../dao/room_dao').Room;
const User = require('../dao/user_dao').User;
const Message = require('../dao/chat_dao').Message;
const winston = require('../utils/logger');
const mongoose = require('mongoose');
const moment = require('moment-jalaali');
const validator = require('../utils/validator');
const mongo_log = require('debug')('goftare:mongo');

exports.createRoom = async (req, res, next) => {
	const {
		user_id
	} = req.body;
	try {
		const secretary = await User.findSecretary();
		const user = await User.findUserById(user_id);
		const secretary_id = secretary._id.toString();
		const valid = validator.joi.validate({
			user_id,
			secretary_id
		}, validator.createRoom);
		if (valid.error) {
			res.json(Object.assign({}, req.base, {
				result: false,
				message: 'input is not valid',
				data: valid.error
			}));
		} else {
			const room_id = mongoose.Types.ObjectId();
			const members = [{
				user_id,
				room_id,
				username: user.username,
				avatar: user.avatar,
				type: user.type, 
				state: 'try'
			}, {
				user_id: secretary_id,
				room_id,
				username: secretary.username,
				avatar: secretary.avatar,
				type: secretary.type, 
				state: 'tryFinished'
			}];
			const lastMessage = {
				text: 'room_created',
				room_id: room_id,
				timestamp: new Date().getTime(),
				moment: moment().format('jYYYY/jMM/jDD HH:mm:ss'),
				sender_id: user_id,
				creator_id: user_id,
				is_read: 1,
				message_id: mongoose.Types.ObjectId()
			};
			const saved = await Room.createRoom(room_id, secretary_id, user_id, members, user_id, secretary_id);
			mongo_log({saved});
			res.json(Object.assign({}, req.base, {
				message: 'room created',
				data: {
					_id: room_id,
					title: saved.title,
					avatar: saved.avatar,
					creator_id: user_id,
					members,
					type: saved.type,
					state: saved.state,
					unreadMessages: 0,
					owner_id: saved.owner_id,
					is_new: saved.is_new,
					lastMessage
				}
			}));
		}
	} catch (e) {
		next(new Error(`Error in create room controller ${e}`));
		mongo_log(e);
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
		if (valid.error) {
			res.json(Object.assign({}, req.base, {
				result: false,
				message: 'input is not valid',
				data: valid.error
			}));
		} else {
			const rooms = await Room.getRooms(user_id);
			mongo_log({rooms});
			for (const room of rooms) {
				const unreadMessages = await Message.getUnreadMessagesById(room._id);
				const lastMessage = await Message.getLastMessage(room._id);
				Object.assign(room, {
					unreadMessages,
					lastMessage
				});
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


exports.notNew = async message => {
	const msg = JSON.parse(message.value);
	try {
		const valid = validator.joi.validate(msg, validator.notNew);
		if(valid.error) {
			winston.error('validate of the message has failed' + valid.error + '....' + msg);
		}else {
			const updated = Room.setIsNewToFalse(msg.room_id);
			mongo_log({'is new is set to false for the room ... ': updated});
		}
	} catch (e) {
		winston.error(`error in  - ${e.status || 500} - ${e.message} - ${e.stack} - ${new Date()}`);
	}
};


exports.choosePsychologist = async message => {
	const msg = JSON.parse(message.value);
	try {
		const valid = validator.joi.validate(msg, validator.choosePsychologist);
		if(valid.error) {
			winston.error('validate of the choosePsychologist has failed' + valid.error + '....' + msg);
		} else {
			const updated = await Room.setSuggestedPsychologist(msg.room_id, msg.psychologist_id);
			mongo_log({'suggested psychologist is set in the room': updated});
		}
	} catch (e) {
		winston.error(`error in choosePsychologist - ${e.status || 500} - ${e.message} - ${e.stack} - ${new Date()}`);
	}
}


exports.expireTransaction = async message => {
	const msg = JSON.parse(message.value);
	try {
		const valid = validator.joi.validate(msg, validator.expireTransaction);
		if (valid.error) {
			winston.error('validation failed for expireTransaction')
		} else {
			const updated = await Room.expireTransaction(msg.room_id, msg.user_id);
			mongo_log({'expireTransaction result': updated});
		}
	} catch (e) {
		winston.error('error in expireTransaction controller');
	}
}