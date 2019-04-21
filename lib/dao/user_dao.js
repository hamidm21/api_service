const mongo = require('../utils/mongo');
const jmoment = require('moment-jalaali');
const vresion = require('../../package.json').vresion;
const bcrypt = require('bcrypt');
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
		unique: false
	},
	avatar: {
		type: String,
		required: true,
		default: 'http://www.goftare.com/profile.png'
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
		default: {


		}
	},
	moment: {
		type: String,
		required: true,
		default: jmoment().format('jYYYY/jMM/jDD HH:mm:ss')
	},
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
				working_time_end: null
			};
			break;
		default:
			user.specific_info = {
				admin: true	
			};
			break;
		}
	}
	if (this.isModified('password') || this.isNew) {
		bcrypt.genSalt(10, function (err, salt) {
			if (err) {
				return next(err);
			} else
				bcrypt.hash(user.password, salt, function (err, hash) {
					if (err) {
						return next(err);
					}
					user.password = hash;
					next();
				});
		});
	} else {
		return next();
	}
});

UserSchema.methods = {
	comparePassword: function (password) {

		return bcrypt.compare(password, this.password);

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
		return this.findOne({_id}, {specific_info: 1});
	},
	getProfile: function (_id) {

		return this.findOne({
			_id
		}, {
			refreshToken: 0,
			password: 0,
			email_notification: 0,
			browser_notification: 0,
			offline_mode: 0
		});
	},
	findPsychologist: function () {
		return this.findOne({
			type: 'Psychologist'
		});
	},
	chooseSecretary: async function () {
		return this.findOne({
			type: 'Secretary'
		}).lean();
		// log(jmoment().format('HH:mm'));
		// if (secretary) {
		// 	secretary.night = false;
		// 	Promise.resolve(secretary);
		// } else {
		// 	const secretary = await this.findOne({
		// 		type: 'Secretary',
		// 		'specific_info.night_secretary': true
		// 	}).lean();
		// 	secretary.night = true;
		// 	Promise.resolve(secretary);
		// }
	},
	editUsername: function (_id, username) {
		return this.findOneAndUpdate({
			_id
		}, {
			$set: {
				username
			}
		});// TODO: do projection with .select({username: 1});
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
	editPassword: function (_id, password) {
		return this.updateOne({_id}, {$set: {password}});
	}
};

exports.User = mongo.model('user_model', UserSchema);