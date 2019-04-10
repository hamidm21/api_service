const mongo = require('../utils/mongo');
const jmoment = require('moment-jalaali');
const vresion = require('../../package.json').vresion;
const bcrypt = require('bcrypt');


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
	specific_information: {
		type: Object,
		required: true
	},
	moment: {
		type: String,
		required: true,
		default: jmoment().format('jYYYY/jMM/jDD HH:mm:ss')
	},
});

UserSchema.pre('save', function (next) {
	const user = this;
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
		return this.find({type: 'Psychologist'});
	},
	getExtraInfo: function (id) {
		return Promise.resolve({
			'_id': '588de843895173aee89b9308',
			'user_id': '588de63b895173aee89b9307',
			'several_child_in_family': '2',
			'count_of_children_in_family': '2',
			'age': '28',
			'sex': 'زن',
			'job': 'خانه دار',
			'education': 'لیسانس',
			'marital_status': 'متاهل',
			'state_location': 'یزد',
			'__v': 0
		});
	},
	getProfile: function (_id) {
		
		return this.findOne({_id}, {refreshToken: 0, password: 0, email_notification: 0, browser_notification: 0, offline_mode: 0})
	},
	findPsychologist: function () {
		return this.findOne({
			type: 'Psychologist'
		});
	},
	findSecretary: function () {
		return this.findOne({
			type: 'Secretary'
		});
	}
};

exports.User = mongo.model('user_model', UserSchema);