const mongo = require('../utils/mongo');
const jmoment = require('moment-jalaali');


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
	avatar: {
		type: String,
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

UserSchema.statics.saveUser = function (email, username) {

	const auth = new this({
		email,
		username
	});

	return auth.save();

};

UserSchema.statics.findUserByIdentity = function (identity) {
	return this.findOne({
		$or: [{
			username: identity
		}, {
			email: identity
		}]
	});
};


exports.User = mongo.model('user_model', UserSchema);