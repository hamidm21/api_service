const mongo = require('../utils/db');
const bcrypt = require('bcrypt');
const jmoment = require('moment-jalaali');


const AuthSchema = mongo.Schema({
	email: {
		type: String,
		required: true,
		trim: true,
		unique: true
	},
	password: {
		type: String,
		required: true,
	},
	type: {
		type: Number,
		required: true,
		default: 1,
		enum: [1, 2, 3, 4]
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
	moment: {
		type: String,
		required: true,
		default: jmoment().format('jYYYY/jMM/jDD HH:mm:ss')
	},
});

AuthSchema.pre('save', function (next) {
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


AuthSchema.methods = {
	comparePassword : function (password) {

		return bcrypt.compare(password, this.password);
	
	}
};

AuthSchema.statics = {
	findAuthByEmail : function (email) {

		return this.findOne({
			email
		});
	
	},
	saveAuth : function (email, password) {

		const auth = new this({
			email,
			password
		});
	
		return auth.save();
	
	}
};

exports.Auth = mongo.model('authentication_model', AuthSchema);