const joi = require('joi');

exports.createRoom = joi.object().keys({
	user_id: joi.string().required().regex(/^[a-f\d]{24}$/i),
	members: joi.optional()
});

exports.getRooms = joi.object().keys({
	user_id: joi.string().required().regex(/^[a-f\d]{24}$/i),
	message_id: joi.string().optional().regex(/^[a-f\d]{24}$/i)
});

exports.refreshToken = joi.object().keys({
	refreshToken: joi.string().required()
});

exports.saveMessage = joi.object().keys({
	primary_key: joi.optional(),
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
	user_id: joi.string().required().regex(/^[a-f\d]{24}$/i),
	message_id: joi.string().optional()
});

exports.Register = joi.object().keys({
	username: joi.string().min(4).max(20).required(),
	email: joi.string().required().email(),
	password: joi.string().required().max(20).min(5),
	ui_version: joi.number().optional(),
	appVersion: joi.number().optional(),
	manufacturer: joi.string().optional(),
  	osVersion: joi.string().optional(),
  	device: joi.string().optional()
});

exports.Login = joi.object().keys({
	email: joi.string().required().email(),
	password: joi.string().required().max(20).min(5)
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
	psychologist_username: joi.string().min(4).max(20).required(),

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
	phone_number: joi.number().min(11).required()
});

exports.extraInfo = joi.object().keys({
	user_id: joi.string().required().regex(/^[a-f\d]{24}$/i)
});

exports.getProfile = joi.object().keys({
	user_id: joi.string().required().regex(/^[a-f\d]{24}$/i),
	profile_id: joi.string().required().regex(/^[a-f\d]{24}$/i),
	room_id: joi.string().optional().regex(/^[a-f\d]{24}$/i)
});

exports.editPassword = joi.object().keys({
	user_id: joi.string().required().regex(/^[a-f\d]{24}$/i),
	current_password: joi.string().required().max(20).min(4),
	new_password: joi.string().required().max(20).min(4)
});

exports.getArticles = joi.object().keys({
	page: joi.number().min(1).required(),
	limit: joi.number().min(1).required(),
	category: joi.string().only('مشاوره خانوادگی', 'مشاوره عمومی', 'مشاوره مرضی').optional()
});

exports.getArticle = joi.object().keys({
	article_id: joi.string().required().max(20).min(4).required()
});

exports.search = joi.object().keys({
	page: joi.number().min(1).required(),
	limit: joi.number().min(1).required(),
	phrase: joi.string().required()
});

exports.notNew = joi.object().keys({
	room_id: joi.string().required().regex(/^[a-f\d]{24}$/i)
});

exports.forgetPassword = joi.object().keys({
	email: joi.string().required().email()
});

exports.setForgetPassword =  joi.object().keys({
	token: joi.string().required(),
	password: joi.string().required().max(20).min(5),
});

exports.joi = joi;