const Room = require('../dao/room_dao').Room;
const User = require('../dao/user_dao').User;
const Message = require('../dao/chat_dao').Message;
const config = require('../config/config');
const winston = require('../utils/logger');
const kafka = require('../handlers/kafka_handler');
const mongoose = require('mongoose');
const jmoment = require('moment-jalaali');
const validator = require('../utils/validator');
const log = require('debug')('api:controller:room');

exports.createRoom = async (req, res, next) => {
	const {
		user_id,
		members
	} = req.body;
	try {
		const valid = validator.joi.validate({
			user_id,
			members
		}, validator.createRoom);
		if (valid.error) {
			res.status(406).json(Object.assign({}, req.base, {
				result: false,
				message: 'input is not valid',
				data: valid.error
			}));
		} else {
			const room_id = mongoose.Types.ObjectId();
			const room_members = members ?
				await User.memberGenerator(room_id, 'subscribed', ...members) :
				await User.memberGenerator(room_id, 'consulting', await User.chooseSecretary(), user_id);
			const notifyMessage = Object.assign({}, config.AUTOMATED_MESSAGE, {
				room_id,
				timestamp: new Date().getTime(),
				creator_id: user_id,
				sender_id: user_id,
				message_id: mongoose.Types.ObjectId(),
				moment: jmoment().format('jYYYY/jMM/jDD HH:mm:ss')
			});
			const automatedMessage = Object.assign({}, config.AUTOMATED_MESSAGE, {
				text: room_members[0].type === 'Secretary' ? new Date().getHours() > 1 && new Date().getHours() < 8 ? await config.SECRETARY_NIGHT_MSG(room_members[0].username) : await config.SECRETARY_MSG(room_members[0].username) : room_members[0].type === 'Psychologist' ? await config.PSYCHOLOGIST_MSG(room_members[0].username) : null,
				type: 'text',
				room_id,
				timestamp: new Date().getTime(),
				sender_id: room_members[0].user_id,
				creator_id: room_members[0].user_id,
				message_id: mongoose.Types.ObjectId(),
				moment: jmoment().format('jYYYY/jMM/jDD HH:mm:ss')
			});
			const lastMessage = [
				notifyMessage,
				automatedMessage
			];
			log({
				lastMessage
			});
			const saved = await Room.createRoom(room_id, room_members[0].user_id, user_id, room_members, user_id, room_members[0].user_id, members ? false : true);
			log({
				saved
			});
			room_members[0].type === 'Secretary' ? await kafka.registerSms(await User.getPhoneNumber(room_members[0].user_id), 'goftarenewuser', room_members[1].username) : null;
			res.json(Object.assign({}, req.base, {
				message: 'room created',
				data: {
					_id: room_id,
					title: saved.type === 'P2P' ? (room_members.filter(member => member.user_id !== mongoose.Types.ObjectId(user_id)))[0].username : 'گروه',
					avatar: saved.avatar,
					creator_id: user_id,
					members: room_members,
					type: saved.type,
					state: saved.state,
					unreadMessages: 0,
					owner_id: saved.owner_id,
					is_new: saved.is_new,
					suggested_psychologist: saved.suggested_psychologist,
					lastMessage,
					is_paid: false,
					is_active: saved.members[0].type === 'Secretary' ? true : false
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
		user_id,
		message_id
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
			const sorted_rooms = await Message.getSortedRooms(user_id, message_id);
			log({
				sorted_rooms
			});
			const rooms = await Room.getRooms(sorted_rooms);
			log({
				'rooms before loop': rooms
			});
			for (const room of rooms) {
				const unreadMessages = await Message.getUnreadMessagesById(room._id, user_id);
				const lastMessage = await Message.getLastMessage(room._id);
				log({
					'the answer': String(room.members[0].user_id) !== String(mongoose.Types.ObjectId(user_id)),
					'first': String(room.members[0].user_id),
					'second': String(mongoose.Types.ObjectId(user_id))
				});
				Object.assign(room, {
					unreadMessages,
					lastMessage: [lastMessage],
					title: room.type === 'P2P' ? (room.members.filter(member => String(member.user_id) !== String(mongoose.Types.ObjectId(user_id))))[0].username : 'گروه'
				});
			}
			log({
				'rooms after loop': rooms
			});
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
		if (valid.error) {
			winston.error('validate of the message has failed' + valid.error + '....' + msg);
		} else {
			const updated = Room.setIsNewToFalse(msg.room_id);
			log({
				'is new is set to false for the room ... ': updated
			});
		}
	} catch (e) {
		winston.error(`error in  - ${e.status || 500} - ${e.message} - ${e.stack} - ${new Date()}`);
	}
};


exports.choosePsychologist = async message => {
	const msg = JSON.parse(message.value);
	try {
		const valid = validator.joi.validate(msg, validator.choosePsychologist);
		if (valid.error) {
			winston.error('validate of the choosePsychologist has failed' + valid.error + '....' + msg);
		} else {
			const updated = await Room.setSuggestedPsychologist(msg.room_id, msg.psychologist_id, msg.psychologist_username);
			log({
				'suggested psychologist is set in the room': updated
			});
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
			log({
				'expireTransaction result': updated
			});
		}
	} catch (e) {
		winston.error('error in expireTransaction controller');
	}
};