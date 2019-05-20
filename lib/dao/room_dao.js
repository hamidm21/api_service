const mongo = require('../utils/db');
const jmoment = require('moment-jalaali');
const log = require('debug')('api:mongo');

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
	transaction: {
		type: mongo.Types.ObjectId,
		ref: 'transaction_model'
	},
	isActive: {
		type: Boolean,
		required: true,
		default: false
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
		type: Object,
		required: true,
		default: {
			psychologist_username: null,
			psychologist_id: null
		}
	}

});


RoomSchema.statics = {

	createRoom: function (_id, psychologist_id, user_id, members, creator_id, owner_id, isActive) {

		const room = new this({
			_id,
			psychologist_id,
			user_id,
			members,
			creator_id,
			owner_id,
			isActive
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
	getRooms: async function (room_ids) {
		try {
			log({
				room_ids
			});
			const rooms = await this.find({
				// isActive: true,
				_id: {
					$in: room_ids,
				}
			},
			{
				_id: 1,
				isActive: 1,
				members: 1,
				title: 1,
				avatar: 1,
				creator_id: 1,
				type: 1,
				state: 1,
				is_new: 1,
				owner_id: 1,
				suggested_psychologist: 1,
				is_paid: 1
			}).lean();
			const result = Array(rooms.length);
			for(const room of rooms) {
				const ix = room_ids.indexOf(String(room._id));
				result.splice(ix, 1, room);
			}
			log({result});
			return Promise.resolve(result);
		} catch (e) {
			return Promise.reject(e);
		}
	},
	setSuggestedPsychologist: async function (_id, psychologist_id, psychologist_username) {
		return this.updateOne({
			_id
		}, {
			$set: {
				suggested_psychologist: {
					psychologist_id,
					psychologist_username
				}
			}
		});

	},
	expireTransaction: async function (_id, user_id) {

		try {
			await this.updateOne({
				_id
			}, {
				$set: {
					is_paid: false,
				},
				$push: {
					expire_dates: jmoment().format('jYYYY/jMM/jDD HH:mm:ss')
				}
			});

			await this.updateOne({
				_id,
				'members.user_id': user_id
			}, {
				$set: {
					'members.$.state': 'expired'
				}
			});

			Promise.resolve(true);
		} catch (e) {
			Promise.reject(e);
		}

	}

};

exports.Room = mongo.model('room_model', RoomSchema);