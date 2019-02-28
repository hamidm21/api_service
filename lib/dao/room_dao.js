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
	title: {
		type: String,
		default: 'group_default_name',
		required: true
	},
	creator_id: {
		type: String,
		required: true
	},
	avatar: {
		type: String,
		default: 'http://goftare.com/group_profile.png'
	},
	type: {
		type: String,
		required: true,
		enum: ['P2P', 'GROUP'],
		default: 'P2P'
	},
	state: {
		type: String,
		required: true,
		enum: ['OPEN', 'CLOSED'],
		default: 'OPEN'
	},
	owner_id: {
		type: String,
		required: true,
	},
	user_id: {
		type: String,
		required: true
	},
	members: {
		type: [Object],
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
	},
	is_new: {
		type: Boolean,
		default: true
	}

});


RoomSchema.statics = {

	createRoom: function (psychologist_id, user_id, members, creator_id, owner_id) {

		const room = new this({
			psychologist_id,
			user_id,
			members,
			creator_id,
			owner_id
		});

		return room.save();

	},
	findRoomById: function (room_id) {

		return this.findOne({
			_id: room_id
		});
	},
	hasActiveRoom: async function (id) {

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

	},
	setIsNewToFalse: async function (room_id) {

		try {
			const updateToFalse = await this.updateOne({
				_id: room_id
			}, {
				$set: {
					isNew: false
				}
			});
			return Promise.resolve(updateToFalse);
		} catch (e) {
			return Promise.reject(e);
		}
	},
	getRooms: async function (id) {

		const rooms = await this.find({
			$or: [{
				user_id: id
			},
			{
				psychologist_id: id
			}
			]
		}, {
			_id: 1,
			members: 1,
			title: 1,
			avatar: 1,
			creator_id: 1,
			type: 1,
			state: 1,
			is_new: 1,
			owner_id: 1
		}).lean();

		if (rooms.length !== 0) {
			return Promise.resolve(rooms);
		} else
			return Promise.resolve(0);
	}

};

exports.Room = mongo.model('room_model', RoomSchema);