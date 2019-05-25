const mongo = require('../utils/db');
const jmoment = require('moment-jalaali');
const mongo_log = require('debug')('api:chamar');


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
	room: {
		type : mongo.Types.ObjectId,
		ref: 'room_model'
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
		enum: ['text', 'voice', 'image', 'file', 'notify'],
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

const PreparedMessageSchema = mongo.Schema({

	psychologist_id: {
		type: String,
		required: true
	},
	text: {
		type: String,
		required: true
	},
	title: {
		type: String,
		required: true
	}

});


MessageSchema.statics = {
	saveMessage: function (incremental_id, user_id, _id, room_id, sender_id, text, timestamp, psychologist_id, offset, moment, type) {
		mongo_log({incremental_id});
		const message = new this({
			_id,
			incremental_id,
			user_id,
			room_id,
			room: mongo.Types.ObjectId(room_id),
			sender_id,
			creator_id: sender_id,
			text,
			timestamp,
			psychologist_id,
			offset,
			moment,
			type
		});

		return message.save();

	},
	readMessages: async function (message_id, offset) {
		mongo_log({message_id});
		try {
			const is_read = await this.updateMany({
				is_read: 1,
				_id: {
					$lte: mongo.Types.ObjectId(message_id)
				},
			}, {
				$set: {
					is_read: 2,
					offset
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
		if (lastmessage) {
			lastmessage[0].message_id = lastmessage[0]._id;
			delete lastmessage[0]._id;
			return Promise.resolve(lastmessage[0]);
		} else
			return Promise.reject(room_id);
	},

	getUnreadMessagesById: function (room_id, user_id) {

		return this.count({
			room_id,
			is_read: 1,
			sender_id: {$ne: user_id}
		});
	},

	getMessages: async function (room_id, limit, user_id, message_id) {

		try {
			if (!message_id) {

				const readMessages = await this.aggregate([
					{
						$match: {
							$or: [
								{
									room_id,
									is_read: 2
								},
								{
									room_id,
									sender_id: user_id
								}
							]
						}
					},
					{
						$sort: {
							timestamp: -1
						}
					},
					{
						$project: {
							message_id: '$_id',
							moment: 1,
							type: 1,
							is_read: 1,
							is_deleted: 1,
							offset: 1,
							incremental_id: 1,
							sender_id: 1,
							room_id: 1,
							creator_id: 1,
							text: 1,
							timestamp: 1,
							psychologist_id: 1,
							_id: 0
						}
					},
					{
						$limit: parseInt(limit)
					}	
				]);
				mongo_log(readMessages + 'read messages ....................................');
				const unReadMessages = await this.aggregate([
					{
						$match: {
							room_id,
							is_read: 1,
							sender_id: {$ne: user_id}
						}
					},
					{
						$project: {
							message_id: '$_id',
							moment: 1,
							type: 1,
							is_read: 1,
							is_deleted: 1,
							offset: 1,
							incremental_id: 1,
							sender_id: 1,
							room_id: 1,
							creator_id: 1,
							text: 1,
							timestamp: 1,
							psychologist_id: 1,
							_id: 0
						}
					}
				]);

				// mongo_log({unReadMessages, unReadMessages})

				const result = {
					unReadMessages,
					'readMessages': readMessages.reverse()
				};

				return Promise.resolve(result);

			} else {
				const readMessages = await this.aggregate([
					{
						$match: {
							_id: {
								$lt: mongo.Types.ObjectId(message_id)
							},
							room_id
						}
					},
					{
						$sort: {
							timestamp: -1
						}
					},
					{
						$project: {
							message_id: '$_id',
							moment: 1,
							type: 1,
							is_read: 1,
							is_deleted: 1,
							offset: 1,
							incremental_id: 1,
							sender_id: 1,
							room_id: 1,
							creator_id: 1,
							text: 1,
							timestamp: 1,
							psychologist_id: 1,
							_id: 0
						}
					},
					{
						$limit: parseInt(limit)
					}	
				]);

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

	getMaxCommitedOffset: async function () {
		try {
			const lastMessageWithOffset = await this.find({})
				.sort({
					offset: -1
				}).limit(1);
			if (lastMessageWithOffset) {
				return Promise.resolve(lastMessageWithOffset[0].offset);
			}else 
				return Promise.resolve(1);
		} catch (e) {
			return Promise.reject(e);
		}
	},

	getSortedRooms: async function(user_id, message_id) {
		try {
			// const test = await this.find().sort({_id: 1}).limit(1).populate('room_model');
			// mongo_log({test});
			// const test = await this.findOne({});
			// mongo_log({test});
			if(!message_id){
				const rooms = await this.aggregate([
					{
						$match: {
							$or: [
								{
									user_id
								},
								{
									psychologist_id: user_id
								}
							]
						}
					},
					{
						$group: {
							_id: '$room_id',
							// timestamp: {$last: '$timestamp'},
							moment: {$last: '$moment'},
							// room: {$project: '$room'}
						}
					},
					{
						$sort: {
							moment: -1	
						}
					},
					{
						$limit: 20
					}
				]);
				// const test = await mongo.model('message_model', MessageSchema).populate(rooms, {path: "room", select: "title"})
				mongo_log({rooms});
				return Promise.resolve(rooms.map(room => room._id));
			}else if (message_id) {
				const rooms = await this.aggregate([
					{
						$match: {
							$or: [
								{
									user_id,
									_id: {$lte: mongo.Types.ObjectId(message_id)}

								},
								{
									psychologist_id: user_id,
									_id: {$lte: mongo.Types.ObjectId(message_id)}
								}
							],
						}
					},
					{
						$group: {
							_id: '$room_id',
							timestamp: {$last: '$timestamp'},
							moment: {$last: '$moment'}
						}
					},
					{
						$sort: {
							moment: -1	
						}
					},
					{
						$limit: 20
					}
				]);
				mongo_log({rooms});
				return Promise.resolve(rooms.map(room => room._id));
			}
		} catch (e) {
			return Promise.reject(e);
		}
	}

};

PreparedMessageSchema.statics = {
	
	getPreparedMessage: async function (psychologist_id) {
		try {
			return this.find({
				psychologist_id
			});
		} catch (e) {
			return Promise.reject(e);
		}
	}
};

exports.Message = mongo.model('message_model', MessageSchema);
exports.PreparedMessage = mongo.model('prepared_message_model', PreparedMessageSchema);