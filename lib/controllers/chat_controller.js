const Message = require('../dao/chat_dao').Message;
const Room = require('../dao/room_dao').Room;
const winston = require('../utils/logger');
const validator = require('../utils/validator');
const mongo_log = require('debug')('goftare:mongo');

exports.saveMessage = async (message) => {
	const msg = JSON.parse(message.value);
	mongo_log(message);
	try {
		const valid = validator.joi.validate(msg, validator.saveMessage);
		if (valid.error)
			winston.info('validate of the message has failed' + valid.error + '....' + msg);
		else {
			const room = await Room.findRoomById(msg.room_id);
			const saved = await Message.saveMessage(room.user_id, msg.message_id, msg.room_id, msg.sender_id, msg.text, msg.time, room.psychologist_id);
			mongo_log(saved);
		}
	} catch (e) {
		winston.error(`error in  - ${e.status || 500} - ${e.message} - ${e.stack} - ${new Date()}`);
	}
};


exports.getMessages = async (req, res, next) => {
	const {
		room_id,
		limit,
		message_id
	} = req.body;
	try {
		const valid = validator.joi.validate({
			room_id,
			limit
		}, validator.getMessages);
		if (valid.error)
			res.status(406).json(Object.assign(req.base, {
				result: false,
				message: 'input is not valid',
				data: valid.error
			}));
		else {
			const result = await Message.getMessages(room_id, limit, message_id);
			res.json(Object.assign(req.base, {
				message: 'messages fetched',
				data: result
			}));
		}
	} catch (e) {
		next(new Error(`Error in getMessages controller ${e}`));
	}
};

exports.readMessage = async (message)=> {
	const msg = JSON.parse(message.value);
	mongo_log(msg);
	try{
		const valid = validator.joi.validate(msg, validator.readMessage);
		if (valid.error)
			winston.info('validate of the message has failed' + valid.error + '....' + msg);
		else {
			const isRead = await Message.ReadMessage(msg.message_id);
			mongo_log(isRead);
		}
	}catch(e){
		winston.error(`error in  - ${e.status || 500} - ${e.message} - ${e.stack} - ${new Date()}`);
	}
};