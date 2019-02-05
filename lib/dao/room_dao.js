const mongo = require('../utils/mongo');
const jmoment = require('moment-jalaali');
const mongo_log = require('debug')('goftare:mongo');

const RoomSchema = mongo.Schema({

	moment: {
		type: String,
		required: true,
		default: jmoment().format('jYYYY/jMM/jDD HH:mm:ss')
	},
	psychologist_id: {
		type: String,
		required: true,
	},
	user_id: {
		type: String,
		required: true
	},
	memebers: {
		type: [String],
		required: true,
	},
	transaction_id: {
		type: String,
		default: ''
	},
	isActive: {
		type: Boolean,
		required: true,
		default: true
	},
	subscribe_state: {
		type: String,
		required: true,
		default: 'try',
		enum: ['try', 'tryFinished', 'subscribed', 'expired']
	},
	is_paid: {
		type: Boolean,
		default: false
	},
	expire_dates: {
		type: [String]
	},
	date: {
		type: String,
		required: true,
		default: jmoment().format('jYYYY/jM/jD')
	},
	time: {
		type: String,
		required: true,
		default: jmoment().format('HH:mm')
	}

});


RoomSchema.statics.createRoom = function (psychologist_id, user_id, members) {

	const room = new this({
		psychologist_id,
		user_id,
		members
	});

	return room.save();

};

RoomSchema.statics.findRoomById = function (room_id) {
	
	return this.findOne({
		_id: room_id
	});
};

RoomSchema.statics.hasActiveRoom = async function (id) {

	const room = await this.find({
		$or: [{
			user_id: id
		}, {
			psychologist_id: id
		}]
	});
	
	if (room.length !== 0) {
		return Promise.resolve(1);
	} else
		return Promise.resolve(0);

};


RoomSchema.statics.getRooms = async function(id){

	const rooms = await this.find({
		$or: [
			{
				user_id: id
			},
			{
				psychologist_id: id
			}
		]
	},{
		_id: 1,
		is_paid: 1,
		psychologist_id: 1,
		user_id: 1,
		subscribe_state: 1
	});

	if(rooms.length !== 0) {
		return Promise.resolve(rooms);
	}else
		return Promise.resolve('shit');
};

exports.Room = mongo.model('room_model', RoomSchema);