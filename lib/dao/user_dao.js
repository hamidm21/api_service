const mongo = require('../utils/mongo');
const jmoment = require('moment-jalaali');
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
		enum: ['User', 'Psychologist', 'secretary', 'Admin']
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
		default: 'test'
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
	comparePassword : function (password) {

		return bcrypt.compare(password, this.password);
	
	}
};

UserSchema.statics = {
	saveUser : function (email, username, password) {

		const auth = new this({
			email,
			username,
			password
		});
	
		return auth.save();
	
	},
	findUserByEmail : function (email) {
		return this.findOne({
			email
		});
	},
	findUserById : function (_id) {
		return this.findOne({
			_id
		});
	},
	getExtraInfo : function(id) {
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
	getProfile : function(id) {
		return Promise.resolve({
			'about': 'زهرا شرفی مقدم هستم با چند سال سابقه مشاوره در زمینه های ازدواج و خانواده، تعلیم و تربیت، اعتیاد و مشاوره تحصیلی.همچنین بر آزمون های روانشناسی و تحلیل آن ها تسلط دارم.',
			'Evidence': 'کارشناسی ارشد روانشناسی بالینی',
			'skill': 'ازدواج، اعتیاد، تعلیم و تربیت، تحصیلی',
			'phone_number': '09168707057',
			'working_hours': '4-8',
			'email': 'user3@gmail.com',
			'register_date': '02/04/97'
		});
	},
	findPsychologist : function() {
		return this.findOne({
			type: 'Psychologist'
		});
	}
};

exports.User = mongo.model('user_model', UserSchema);