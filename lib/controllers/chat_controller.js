/**
 * @namespace {module} chat_controller
 */

const Message = require('../dao/chat_dao').Message;
const PreparedMessage = require('../dao/chat_dao').PreparedMessage;
const Room = require('../dao/room_dao').Room;
const kafka_handler = require('../handlers/kafka_handler');
const winston = require('../utils/logger');
const validator = require('../utils/validator');
const mongo_log = require('debug')('goftare:mongo');

exports.saveMessage = async message => {
	const msg = JSON.parse(message.value);
	try {
		const valid = validator.joi.validate(msg, validator.saveMessage);
		if (valid.error)
			winston.error('validate of the message has failed' + valid.error + '....' + msg);
		else {
			const room = await Room.findRoomById(msg.room_id);
			const saved = await Message.saveMessage(msg.incremental_id, room.user_id, msg.message_id, msg.room_id, msg.sender_id, msg.text, msg.timestamp, room.psychologist_id, message.highWaterOffset, msg.moment, msg.type);
			if(room.is_new && msg.sender_id === room.owner_id){
				await Room.setIsNewToFalse(room._id);
				const sendIsNew = kafka_handler.sendIsNewFalse(room._id);
				mongo_log(sendIsNew);
			}
			mongo_log(saved);
		}
	} catch (e) {
		winston.error(`error in  - ${e.status || 500} - ${e.message} - ${e.stack} - ${new Date()}`);
	}
};


/**
 * @memberof chat_controller 
 * @function getMessages
 * @param {ID} room_id - id of the selected room
 * @param {number} limit - limit number of messages to be sent
 * @param {ID} message_id - this param is not required but it will get as much as the limit number from messages when scrolling up
 *     
 */

exports.getMessages = async (req, res, next) => {
	const {
		room_id,
		limit,
		message_id
	} = req.body;
	try {
		mongo_log(req.body);
		const valid = validator.joi.validate({
			room_id,
			limit
		}, validator.getMessages);
		if (valid.error)
			res.status(406).json(Object.assign({}, req.base, {
				result: false,
				message: 'input is not valid',
				data: valid.error
			}));
		else {
			const result = await Message.getMessages(room_id, limit, message_id);
			mongo_log({'asdasdasdasdsda':  result});
			res.json(Object.assign({}, req.base, {
				message: 'messages fetched',
				data: result
			}));
		}
	} catch (e) {
		next(new Error(`Error in getMessages controller ${e}`));
	}
};

exports.readMessage = async (message) => {
	const msg = JSON.parse(message.value);
	mongo_log(msg);
	try {
		const valid = validator.joi.validate(msg, validator.readMessage);
		if (valid.error) {
			winston.error('validate of the message has failed' + valid.error + '....' + msg);
		} else {
			const isRead = await Message.readMessages(msg.message_id);
			mongo_log(isRead);
		}
	} catch (e) {
		winston.error(`error in  - ${e.status || 500} - ${e.message} - ${e.stack} - ${new Date()}`);
	}
};


exports.getPreparedMessage = async (req, res, next) => {
	const {
		psychologist_id
	} = req.base;
	try {
		const valid = validator.joi.validate({psychologist_id}, validator.getPreparedMessage);
		if (valid.error) {
			winston.error(`error in getPreparedMessage  - ${valid.error.status || 500} - ${valid.error.mvalid.errorssagvalid.error} - ${valid.error.stack} - ${new Date()}`);
			next(new Error(valid.error));
		} else {
			const preparedMessage = await PreparedMessage.getPreparedMessage(psychologist_id);
			res.json(Object.assign({}, req.base, {
				message: 'success',
				data: preparedMessage
			}));
		}
	} catch (e) {
		winston.error(`error in getPreparedMessage  - ${e.status || 500} - ${e.message} - ${e.stack} - ${new Date()}`);
		next(new Error(e));
	}
};