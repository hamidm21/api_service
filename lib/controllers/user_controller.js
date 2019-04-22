const validator = require('../utils/validator');
const log = require('debug')('api:mongo');
const User = require('../dao/user_dao').User;


exports.extraInfo = async (req, res, next) => {
	const {
		user_id
	} = req.body;
	try {
		const valid = validator.joi.validate(req.body, validator.extraInfo);
		if (valid.error) {
			res.status(406).json(Object.assign({}, req.base, {
				result: false,
				message: 'extraInfo input is not valid',
				data: valid.error
			}));
		} else {
			const extraInfo = await User.getExtraInfo(user_id);
			if (extraInfo.length === 0) {
				res.json(Object.assign({}, req.base, {
					result: false,
					message: 'no extra info',
				}));
			} else
				res.json(Object.assign({}, req.base, {
					message: 'extra info found',
					data: extraInfo
				}));
		}
	} catch (e) {
		next(new Error(`Error in extraInfo controller ${e}`));
	}
};


exports.getProfile = async (req, res, next) => {
	const {
		user_id
	} = req.body;
	try {
		const valid = validator.joi.validate(req.body, validator.getProfile);
		if (valid.error) {
			res.status(406).json(Object.assign({}, req.base, {
				result: false,
				message: 'getProfile input is not valid',
				data: valid.error
			}));
		} else {
			const profile = await User.getProfile(user_id);
			if (profile.length === 0) {
				res.json(Object.assign({}, req.base, {
					result: false,
					message: 'no profile info',
				}));
			} else
				res.json(Object.assign({}, req.base, {
					message: 'profile found',
					data: profile
				}));
		}
	} catch (e) {
		next(new Error(`Error in getProfile controller ${e}`));
	}
};

exports.getPsychologistsList = async (req, res, next) => {
	try {
		const psychologistsList = await User.getPsychologistList();
		res.json(Object.assign({}, req.base, {
			message: 'psychologist list found',
			data: psychologistsList
		}));
	} catch (e) {
		next(new Error(`Error in getPsychologistList controller ${e}`));
	}
};

exports.editUsername = async (req, res, next) => {
	const {
		user_id,
		username
	} = req.body;
	try {
		const valid = validator.joi.validate(req.body, validator.editUsername);
		if (valid.error) {
			res.status(406).json(Object.assign({}, req.base, {
				result: false,
				message: 'editUsername input is not valid',
				data: valid.error
			}));
		} else {
			const updated = await User.editUsername(user_id, username);
			res.json(Object.assign({}, req.base, {
				message: 'success',
				data: updated
			}));
		}
	} catch (e) {
		next(new Error(e));
	}
};

exports.editProfilePicture = async (req, res, next) => {
	const {
		user_id,
		username
	} = req.body;
	try {
		const valid = validator.joi.validate(req.body, validator.editUsername);
		if (valid.error) {
			res.status(406).json(Object.assign({}, req.base, {
				result: false,
				message: 'editUsername input is not valid',
				data: valid.error
			}));
		} else {
			const updated = await User.editUsername(user_id, username);
			res.json(Object.assign({}, req.base, {
				message: 'success',
				data: updated
			}));
		}
	} catch (e) {
		next(new Error(e));
	}
};

exports.editPhoneNumber = async (req, res, next) => {
	const {
		user_id,
		phone_number
	} = req.body;
	try {
		const valid = validator.joi.validate(req.body, validator.editPhoneNumber);
		if (valid.error) {
			res.status(406).json(Object.assign({}, req.base, {
				result: false,
				message: 'editPhoneNumber input is not valid',
				data: valid.error
			}));
		} else {
			const updated = await User.editPhoneNumber(user_id, phone_number);
			res.json(Object.assign({}, req.base, {
				message: 'success',
				data: updated
			}));
		}
	} catch (e) {
		next(new Error(e));
	}
};

exports.editPassword = async (req, res, next) => {
	const {
		user_id,
		current_password,
		new_password
	} = req.body;
	try {
		const valid = validator.joi.validate(req.body, validator.editPassword);
		if (valid.error) {
			res.status(406).json(Object.assign({}, req.base, {
				result: false,
				message: 'editPassword input is not valid',
				data: valid.error
			}));
		} else {
			const user = await User.findUserById(user_id);
			const pass_correct = await user.comparePassword(current_password);
			if (pass_correct) {
				const updated = await User.editPassword(user_id, new_password);
				res.json(Object.assign({}, req.base, {
					message: 'success',
					data: updated
				}));
			} else {
				res.status(401).json(Object.assign({}, req.base, {
					message: 'credentials are not correct'
				}));
			}
		}
	} catch (e) {
		next(new Error(e));
	}
};


// exports.editSpecificInfo = async (req, res, next) => {
// 	try {
// 		const updated = await User.editSpecificInfo();
// 	} catch (e) {
// 		next(new Error(e));
// 	}
// };


exports.registerWithType = async (req, res, next) => {
	const {
		username,
		email,
		password,
		type
	} = req.body;
	try {
		// const valid = validator.joi.validate(req.body, validator.registerPsychologist);
		// if (valid.error) {
		// 	res.status(406).json(Object.assign({}, req.base, {
		// 		result: false,
		// 		message: 'editPassword input is not valid',
		// 		data: valid.error
		// 	}));
		// } else {
		const updated = await User.registerWithType(username, password, email, type);
		res.json(Object.assign({}, req.base, {
			message: 'success',
			data: updated
		}));
		// }
	} catch (e) {
		next(new Error(e));
	}
};