const joi = require('joi');

exports.createRoom = joi.object().keys({
	user_id: joi.string().required().length(24),
	psychologist_id: joi.string(),
	secretary_id: joi.string()
});

exports.getRooms = joi.object().keys({
	user_id: joi.string().required().length(24),
});

exports.saveMessage = joi.object().keys({
	incremental_id: joi.number().required(),
	message_id: joi.string().required(),
	timestamp: joi.required(),
	sender_id: joi.required(),
	room_id: joi.required(),
	text: joi.required(),
	moment: joi.required(),
	creator_id: joi.optional(),
	is_read: joi.optional(),
	type: joi.optional()
});

exports.getMessages = joi.object().keys({
	room_id: joi.string().required(),
	limit: joi.number().required(),
	message_id: joi.string().optional()
});

exports.Register = joi.object().keys({
	username: joi.string().alphanum().min(4).max(20).required(),
	email: joi.string().required().email(),
	password: joi.string().required().max(20).min(4)
});

exports.Login = joi.object().keys({
	email: joi.string().required().email(),
	password: joi.string().required().max(20).min(4)
});

exports.readMessage = joi.object().keys({
	message_id: joi.string().required(),
	room_id: joi.string().required(),
	receiver_id: joi.string().required(),
	sender_id: joi.string().required(),
});

exports.joi = joi;