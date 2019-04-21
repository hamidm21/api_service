const Room = require('../dao/room_dao').Room;
const User = require('../dao/user_dao').User;
const Message = require('../dao/chat_dao').Message;
const config = require('../config/config');
const winston = require('../utils/logger');
const kafka = require('../handlers/kafka_handler');
const mongoose = require('mongoose');
const moment = require('moment-jalaali');
const validator = require('../utils/validator');
const log = require('debug')('api:controller:room');

exports.createRoom = async (req, res, next) => {
	const {
		user_id
	} = req.body;
	try {
		const secretary = await User.chooseSecretary();
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
			const notifyMessage = Object.assign({}, config.AUTOMATED_MESSAGE, {
				room_id,
				creator_id: user_id,
				sender_id: user_id,
				message_id: mongoose.Types.ObjectId()
			});
			const automatedMessage = Object.assign({}, config.AUTOMATED_MESSAGE, {
				text: secretary.night ? config.SECRETARY_NIGHT_MSG : config.SECRETARY_MSG,
				type: 'text',
				room_id,
				sender_id: secretary_id,
				creator_id: secretary_id,
				message_id: mongoose.Types.ObjectId()
			});
			const lastMessage = [
				notifyMessage,
				automatedMessage
			];
			log({lastMessage});
			const saved = await Room.createRoom(room_id, secretary_id, user_id, members, user_id, secretary_id);
			log({saved});
			await kafka.registerSms(secretary.specific_info.phone_number, 'goftarenewuser', user.username);
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
		log(e);
		next(new Error(`Error in create room controller ${e.stack}`));
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
			log({rooms});
			for (const room of rooms) {
				const unreadMessages = await Message.getUnreadMessagesById(room._id);
				const lastMessage = await Message.getLastMessage(room._id);
				Object.assign(room, {
					unreadMessages,
					lastMessage: [lastMessage]
				});
			}
			log(rooms);
			res.json(Object.assign({}, req.base, {
				message: 'got rooms',
				data: rooms
			}));
		}
	} catch (e) {
		log(e);
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
			log({'is new is set to false for the room ... ': updated});
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
			log({'suggested psychologist is set in the room': updated});
		}
	} catch (e) {
		winston.error(`error in choosePsychologist - ${e.status || 500} - ${e.message} - ${e.stack} - ${new Date()}`);
	}
};


exports.expireTransaction = async message => {
	const msg = JSON.parse(message.value);
	try {
		const valid = validator.joi.validate(msg, validator.expireTransaction);
		if (valid.error) {
			winston.error('validation failed for expireTransaction');
		} else {
			const updated = await Room.expireTransaction(msg.room_id, msg.user_id);
			log({'expireTransaction result': updated});
		}
	} catch (e) {
		winston.error('error in expireTransaction controller');
	}
};