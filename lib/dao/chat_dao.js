const mongo = require('../utils/mongo');
const jmoment = require('moment-jalaali');
const mongo_log = require('debug')('goftare:mongo');


const MessageSchema = mongo.Schema({
	moment: {
		type: String,
		required: true,
		default: jmoment().format('jYYYY/jMM/jDD HH:mm:ss')
	},
	midnight_msg: {
		type: Number,
		required: true,
		default: 0,
		enum: [0, 1]
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
	sender_avatar: {
		type: String
	},
	time: {
		type: String,
		required: true,
		default: jmoment().format('HH:mm:ss')
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


MessageSchema.statics.saveMessage = function (user_id, _id, room_id, sender_id, text, time, psychologist_id, offset) {

	const message = new this({
		_id,
		user_id,
		room_id,
		sender_id,
		text,
		time,
		psychologist_id,
		offset
	});

	return message.save();

};

MessageSchema.statics.readMessages = async function (message_id) {

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

};

MessageSchema.statics.getMessages = async function (room_id, limit, message_id) {

	if(!message_id){
		const lastReadMessage = await this.find({
			room_id,
		}).sort({
			_id: -1
		}).limit(1);
		mongo_log(lastReadMessage[0]._id);

		if(lastReadMessage.length !== 0){
	
			const readMessages = await this.find({
				_id: {
					$lt: lastReadMessage[0]._id.toString()
				},
				room_id
			}).limit(parseInt(limit));
		
			const unReadMessages = await this.find({
				_id: {
					$gt: lastReadMessage[0]._id
				},
				room_id,
				is_read: 1
			});
		
			const result = {
				unReadMessages,
				readMessages
			};
		
			return Promise.resolve(result);
		
		}else{
			const readMessages = await this.find({
				room_id,
			}).limit(parseInt(limit));
	
			const result ={
				readMessages
			};
	
			return Promise.resolve(result);
		}
	}else{
		const readMessages = await this.find({
			_id: {$lt: message_id},
			room_id
		}).limit(parseInt(limit));

		const result = {
			readMessages
		};

		return Promise.resolve(result);
	}
	
};


exports.Message = mongo.model('Message', MessageSchema);