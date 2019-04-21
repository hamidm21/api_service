const joi = require('joi');

exports.createRoom = joi.object().keys({
	user_id: joi.string().required().regex(/^[a-f\d]{24}$/i),
	psychologist_id: joi.string(),
	secretary_id: joi.string()
});

exports.getRooms = joi.object().keys({
	user_id: joi.string().required().regex(/^[a-f\d]{24}$/i),
});

exports.refreshToken = joi.object().keys({
	refreshToken: joi.string().required()
});

exports.saveMessage = joi.object().keys({
	incremental_id: joi.required(),
	message_id: joi.string().required(),
	timestamp: joi.required(),
	sender_id: joi.required(),
	room_id: joi.required(),
	text: joi.required(),
	moment: joi.optional(),
	creator_id: joi.optional(),
	is_read: joi.optional(),
	type: joi.optional(),
	id: joi.optional(),
	isDeleted: joi.optional(),
	isEdited: joi.optional(),
	viewType: joi.optional(),
	replyId: joi.optional()
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

exports.choosePsychologist = joi.object().keys({
	room_id: joi.string().required().regex(/^[a-f\d]{24}$/i),
	psychologist_id: joi.string().required().regex(/^[a-f\d]{24}$/i),
});

exports.getPreparedMessage = joi.object().keys({
	psychologist_id: joi.string().required().regex(/^[a-f\d]{24}$/i)
});

exports.editUsername = joi.object().keys({
	user_id: joi.string().required().regex(/^[a-f\d]{24}$/i),
	username: joi.string().min(5).required()
});

exports.editPhoneNumber = joi.object().keys({
	user_id: joi.string().required().regex(/^[a-f\d]{24}$/i),
	phone_number: joi.string().min(11).required()
});
exports.joi = joi;