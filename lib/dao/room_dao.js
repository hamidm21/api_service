const mongo = require('../utils/mongo');
const jmoment = require('moment-jalaali');
const mongo_log = require('debug')('api:mongo');

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
		default: 'http://goftare.com/group-profile.png'
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
	},
	suggested_psychologist: {
		type: String,
		default: ''
	}

});


RoomSchema.statics = {

	createRoom: function (_id, psychologist_id, user_id, members, creator_id, owner_id) {

		const room = new this({
			_id,
			psychologist_id,
			user_id,
			members,
			creator_id,
			owner_id
		});

		return room.save();

	},
	findRoomById: function (_id) {

		return this.findOne({
			_id
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
	},
	setSuggestedPsychologist: async function (_id, psychologist_id) {


		return this.updateOne({_id}, {$set: {
			suggested_psychologist: psychologist_id
		}});
		
	},
	expireTransaction: async function (_id, user_id) {

		try {
			await this.updateOne({_id}, {$set: {is_paid: false}});

			await this.updateOne({_id, 'members.user_id': user_id}, {$set: {
				'members.$.state': 'unsubscribed'
			}});

			Promise.resolve(true);
		} catch(e) {
			Promise.reject(e);
		}
	
	}

};

exports.Room = mongo.model('room_model', RoomSchema);