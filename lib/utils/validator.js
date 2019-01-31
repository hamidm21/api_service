const joi = require('joi');

const createRoom = joi.object().keys({
	user_id: joi.string().required().length(24),
	psychologist_id: joi.string().required().length(24)
});

const saveMessage = joi.object().keys({
	message_id: joi.string().required(),
	time: joi.required(),
	sender_id: joi.required(),
	room_id: joi.required(),
	text: joi.required()
});

const getMessages = joi.object().keys({
	room_id: joi.string().required(),
	limit: joi.number().required()
});

const Register = joi.object().keys({
	username: joi.string().alphanum().min(4).max(20).required(),
	email: joi.string().required().email(),
	password: joi.string().required().max(20).min(4)
});

const Login = joi.object().keys({
	email: joi.string().required().email(),
	password: joi.string().required().max(20).min(4)
});

const readMessage = joi.object().keys({
	message_id:	joi.string().required(),
	room_id: joi.string().required(),
	receiver_id: joi.string().required(),
	sender_id: joi.string().required(),
});

module.exports = {
	joi,
	createRoom,
	saveMessage,
	getMessages,
	Register,
	Login,
	readMessage
};