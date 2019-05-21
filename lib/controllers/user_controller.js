const validator = require('../utils/validator');
const log = require('debug')('api:controller:user');
const mogno = require('../utils/db');
const User = require('../dao/user_dao').User;
const Room = require('../dao/room_dao').Room;
const Transaction = require('../dao/transaction_dao').Transaction;


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
		user_id,
		profile_id,
		room_id
	} = req.body;
	try {
		log({
			'get profile data': req.body
		});
		const valid = validator.joi.validate(req.body, validator.getProfile);
		if (valid.error) {
			res.status(406).json(Object.assign({}, req.base, {
				result: false,
				message: 'getProfile input is not valid',
				data: valid.error
			}));
		} else {
			log('start getting profile');
			const user = await User.findOne({
				_id: user_id
			}, {
				type: 1
			});
			const profile = await User.findOne({
				_id: profile_id
			}, {
				type: 1
			});
			log({
				'answer of two queries': true,
				user,
				profile
			});
			switch (true) {
			case user.type === 'User' && profile.type === 'Secretary': {
				log('case 1');
				res.json(Object.assign({}, req.base, {
					message: 'profile found',
					data: await User.findOne({
						_id: profile_id
					}, {
						username: 1,
						type: 1,
						avatar: 1,
						email: 1,
						'specific_info.about': 1,
						'specific_info.working_time_start': 1,
						'specific_info.working_time_end': 1
					})
				}));
				break;
			}
			case user.type === 'User' && profile.type === 'Psychologist': {
				log('case 2');
				res.json(Object.assign({}, req.base, {
					message: 'profile found',
					data: await User.findOne({
						_id: profile_id
					}, {
						username: 1,
						type: 1,
						avatar: 1,
						email: 1,
						'specific_info.degree': 1,
						'specific_info.skill': 1
					})
				}));
				break;
			}
			case user.type === 'Psychologist' && profile.type === 'User': {
				log('case 3');
				const prof = await User.findOne({
					_id: profile_id
				}, {
					username: 1,
					type: 1,
					avatar: 1,
					email: 1,
					register_date: 1
				}).lean();
				log({
					prof
				});
				const room = await Room.findOne({
					_id: room_id,
					'members.user_id': mogno.Types.ObjectId(profile_id)
				}, {
					'members.$.state': 1,
					transaction_id: 1,
					is_paid: 1
				}).lean();
				log({
					room
				});
				const transaction = await Transaction.findOne({
					_id: room.transaction_id
				}, {
					subscribe_title: 1
				}).lean();
				log({
					transaction
				});
				res.json(Object.assign({}, req.base, {
					message: 'profile found',
					data: Object.assign({}, prof, room, transaction)
				}));
				break;
			}
			case user.type === 'Secretary' && profile.type === 'User':
				res.json(Object.assign({}, req.base, {
					message: 'profile found',
					data: await User.findOne({
						_id: profile_id
					}, {
						username: 1,
						type: 1,
						avatar: 1,
						email: 1,
						register_date: 1
					})
				}));
				break;
			default: {
				res.json(Object.assign({}, req.base, {
					message: 'user type not found',
					// data: await User.findOne({_id: profile_id}, {username: 1, type: 1, avatar: 1, email: 1})
				}));
			}	
			}
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

exports.registerWithType = async (req, res, next) => {
	const {
		username,
		email,
		password,
		type
	} = req.body;
	try {
		const updated = await User.registerWithType(username, password, email, type);
		res.json(Object.assign({}, req.base, {
			message: 'success',
			data: updated
		}));
	} catch (e) {
		next(new Error(e));
	}
};