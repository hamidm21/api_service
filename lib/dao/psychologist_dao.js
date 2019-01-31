const mongo = require('../utils/mongo');
const jmoment = require('moment-jalaali');


const PsychologistSchema = mongo.Schema({
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
	user_id: {
		type: String,
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
	phone_number: {
		type: String,
	},
	skill: {
		type: String
	},
	evidence: {
		type: String
	},
	client_number: {
		type: Number
	},
	priority: {
		type: Number
	},
	about: {
		type: String
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

PsychologistSchema.statics.savePscyhologist = function (email, username) {

	const auth = new this({
		email,
		username
	});

	return auth.save();

};

PsychologistSchema.statics.findPsychologistByIdentity = function (identity) {
	return this.findOne({
		$or: [{
			username: identity
		}, {
			email: identity
		}]
	});
};


exports.Psycho = mongo.model('Psychologist_model', PsychologistSchema);