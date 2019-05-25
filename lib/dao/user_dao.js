const mongo = require('../utils/db');
const jmoment = require('moment-jalaali');
const vresion = require('../../package.json').vresion;
// const bcrypt = require('bcrypt');
const passHash = require('password-hash');
const log = require('debug')('api:dao:user');


const UserSchema = mongo.Schema({
	email: {
		type: String,
		required: true,
		trim: true,
		unique: true
	},
	username: {
		type: String,
		required: true,
		trim: true
	},
	password: {
		type: String,
		required: true,
	},
	type: {
		type: String,
		required: true,
		default: 'User',
		enum: ['User', 'Psychologist', 'Secretary', 'Admin']
	},
	blocked: {
		type: Boolean,
		required: true,
		default: false
	},
	refreshToken: {
		type: String,
		default: null
	},
	avatar: {
		type: String,
		default: ''
	},
	email_notification: {
		type: Boolean,
		required: true,
		default: true
	},
	browser_notification: {
		type: Boolean,
		required: true,
		default: true
	},
	sms_notification: {
		type: Boolean,
		required: true,
		default: true
	},
	app_vresion: {
		type: String,
		default: vresion
	},
	os_type: {
		type: String,
	},
	device_details: {
		type: Object
	},
	offline_mode: {
		type: Boolean,
		required: true,
		default: false
	},
	country: {
		type: String,
		required: true,
		default: 'iran'
	},
	register_date: {
		type: String,
		required: true,
		default: jmoment().format('jYYYY/jM/jD')
	},
	specific_info: {
		type: Object,
		required: true,
		default: {}
	},
	moment: {
		type: String,
		required: true,
		default: jmoment().format('jYYYY/jMM/jDD HH:mm:ss')
	},
	pass_recovery: {
		type: String
	},
	pass_recovery_deadline: {
		type: Date
	}
});

UserSchema.pre('save', function (next) {
	const user = this;
	if (this.isModified('type') || this.isNew) {
		switch (user.type) {
		case 'User':
			user.specific_info = {
				suggested_psychologist: [],
				which_child_user_is: null,
				count_of_children_in_family: null,
				age: null,
				gender: null,
				job: null,
				education: null,
				marital_status: null,
				provenance: null,
			};
			break;
		case 'Psychologist':
			user.specific_info = {
				phone_number: null,
				skill: [],
				degree: null,
				about: null,
				commission_perentage: null,
			};
			break;
		case 'Secretary':
			user.specific_info = {
				phone_number: null,
				about: null,
				working_time_start: null,
				working_time_end: null,
				night: false
			};
			break;
		default:
			user.specific_info = {
				admin: true
			};
			break;
		}
		if (this.isModified('password') || this.isNew) {
			const password = passHash.generate(user.password);
			user.password = password;
			next();
			// bcrypt.genSalt(10, function (err, salt) {
			// 	if (err) {
			// 		return next(err);
			// 	} else
			// 		bcrypt.hash(user.password, salt, function (err, hash) {
			// 			if (err) {
			// 				return next(err);
			// 			}
			// 			user.password = hash;
			// 			next();
			// 		});
			// });
		}
	} else {
		return next();
	}
});

// UserSchema.pre('save', function (next) {
// 	const user = this;

// 	} else {
// 		return next();
// 	}
// });


UserSchema.methods = {
	comparePassword: function (password) {

		return Promise.resolve(passHash.verify(password, this.password));

	}
};

UserSchema.statics = {
	saveUser: function (email, username, password) {

		const auth = new this({
			email,
			username,
			password
		});

		return auth.save();

	},
	registerWithType: function (username, password, email, type) {

		const user = new this({
			username,
			password,
			email,
			type
		});

		return user.save();

	},
	findUserByRefreshToken: function (refreshToken) {
		return this.findOne({
			refreshToken
		});
	},
	findUserByEmail: function (email) {
		return this.findOne({
			email
		});
	},
	findUserById: function (_id) {
		return this.findOne({
			_id
		});
	},
	getPsychologistList: function () {
		return this.find({
			type: 'Psychologist'
		});
	},
	getExtraInfo: function (_id) {
		return this.findOne({
			_id
		}, {
			specific_info: 1
		});
	},
	// getProfile: function (_id, ...projection) {

	// 	return this.findOne({
	// 		_id
	// 	}, {
	// 		avatar: 1,
	// 		username: 1,
	// 		type: 1,
	// 		specific_info: 1,
	// 	});
	// },
	findPsychologist: function () {
		return this.findOne({
			type: 'Psychologist'
		});
	},
	chooseSecretary: async function () {
		const secretary = await this.findOne({
			type: 'Secretary',
			$or: [{
				$and: [{
					'specific_info.working_time_start': {
						$lte: jmoment().format('HH:mm')
					}
				},
				{
					'specific_info.working_time_end': {
						$gte: jmoment().format('HH:mm')
					}
				}
				]
			},
			{
				'specific_info.night': {
					$eq: true
				}
			}
			]
		}).lean();
		log({
			secretary
		});
		return Promise.resolve(String(secretary._id));
	},
	editUsername: function (_id, username) {
		return this.findOneAndUpdate({
			_id
		}, {
			$set: {
				username
			}
		}); // TODO: do projection with .select({username: 1});
	},
	editPhoneNumber: function (_id, phone_number) {
		return this.updateOne({
			_id
		}, {
			$set: {
				'specific_info.phone_number': phone_number
			}
		});
	},
	editPassword: async function (_id, password) {
		// const salt = await bcrypt.genSalt(10);
		// const hash = await bcrypt.hash(password, salt);
		const hash = passHash.generate(password);
		return this.updateOne({
			_id
		}, {
			$set: {
				password: hash
			}
		});	
		
	},
	memberGenerator: async function (room_id, state, ...members) {
		try {
			log({
				members
			});
			const room_members = [];
			for (const member of members) {
				log(member);
				const m = await this.findOne({
					_id: member
				}, {
					username: 1,
					avatar: 1,
					type: 1
				}).lean();
				m.user_id = m._id;
				delete m._id;
				room_members.push(Object.assign({}, m, {
					state,
					room_id
				}));
				log({
					room_members
				});
			}
			log({
				room_members
			});
			return Promise.resolve(room_members);
		} catch (e) {
			return Promise.reject(e);
		}
	},
	getPhoneNumber: async function (_id) {
		try {
			const user = await this.findOne({
				_id
			}, {
				specific_info: 1
			});
			log({
				user
			});
			return Promise.resolve(String(user.specific_info.phone_number));
		} catch (e) {
			return Promise.reject({
				'error in get Phone Number': e
			});
		}
	},
	setRefreshToken: function (_id, refreshToken) {
		return this.updateOne({
			_id
		}, {
			$set: {
				refreshToken
			}
		});
	}
};

exports.User = mongo.model('user_model', UserSchema);