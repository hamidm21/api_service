const mongo = require('../utils/mongo');
const jmoment = require('moment-jalaali');
const mongo_log = require('debug')('goftare:chamar');


const MessageSchema = mongo.Schema({
	incremental_id: {
		type: Number,
		required: true,
	},
	moment: {
		type: String,
		required: true,
		default: jmoment().format('jYYYY/jMM/jDD HH:mm:ss')
	},
	midnight_msg: {
		type: Boolean,
		required: true,
		default: false
	},
	psychologist_id: {
		type: String,
		required: true
	},
	user_id: {
		type: String,
		required: true
	},
	room_id: {
		type: String,
		required: true
	},
	sender_id: {
		type: String,
		required: true
	},
	creator_id: {
		type: String,
		required: true
	},
	sender_avatar: {
		type: String
	},
	type: {
		type: String,
		required: true,
		enum: ['text', 'voice', 'image', 'file'],
		default: 'text'
	},
	content: {
		type: String
	},
	timestamp: {
		type: String,
		required: true,
	},
	text: {
		type: String,
		required: true,
	},
	is_read: {
		type: Number,
		required: true,
		default: 1,
		enum: [0, 1, 2]
	},
	is_deleted: {
		type: Number,
		default: 0,
		enum: [0, 1]
	},
	offset: {
		type: Number,
		required: true,
		default: 1
	}
});


MessageSchema.statics = {
	saveMessage: function (incremental_id, user_id, _id, room_id, sender_id, text, timestamp, psychologist_id, offset, moment) {
		mongo_log({incremental_id})
		const message = new this({
			_id,
			incremental_id,
			user_id,
			room_id,
			sender_id,
			creator_id: sender_id,
			text,
			timestamp,
			psychologist_id,
			offset,
			moment
		});

		return message.save();

	},
	readMessages: async function (message_id) {

		try {
			const is_read = await this.updateMany({
				_id: {
					$lte: message_id
				}
			}, {
				$set: {
					is_read: 2
				}
			});
			if (is_read) {
				return Promise.resolve(is_read);
			} else
				return Promise.reject('readMessage dao has problems');

		} catch (e) {
			return Promise.reject(e);
		}
	},
	getLastMessage: async function (room_id) {

		const lastmessage = await this.find({
			room_id
		}).sort({
			moment: -1
		})
			.limit(1)
			.lean();
		if (lastmessage.length !== 0) {
			lastmessage[0].message_id = lastmessage[0]._id;
			delete lastmessage[0]._id;
			return Promise.resolve(lastmessage[0]);
		} else
			return Promise.resolve({});
	},

	getUnreadMessagesById: function (room_id) {

		return this.count({
			room_id,
			is_read: 1
		});
	},

	getMessages: async function (room_id, limit, message_id) {

		try {
			if (!message_id) {

				const readMessages = await this.find({
					room_id,
					is_read: 2	
				}).sort({
					incremental_id: -1,
					_id: -1
				}).limit(parseInt(limit));
				mongo_log(readMessages + 'read messages ....................................');
				const unReadMessages = await this.find({
					room_id,
					is_read: 1
				});

				const result = {
					unReadMessages,
					readMessages
				};

				return Promise.resolve(result);

			} else {
				const readMessages = await this.find({
					_id: {
						$lt: message_id
					},
					room_id
				}).sort({
					incremental_id: -1,
					_id: -1
				}).limit(parseInt(limit));

				const result = {
					unReadMessages: [],
					readMessages
				};

				return Promise.resolve(result);
			}

		} catch (e) {
			return Promise.reject(e);
		}
	},

	getLastCommitedOffset: async function () {
		try {
			const lastMessageWithOffset = await this.find({})
				.sort({
					_id: -1
				}).limit(1);
			if (lastMessageWithOffset) {
				return Promise.resolve(lastMessageWithOffset[0].offset);
			}else 
				return Promise.resolve(1);
		} catch (e) {
			return Promise.reject(e);
		}
	}

};

exports.Message = mongo.model('message_model', MessageSchema);