const validator = require('../utils/validator');
const mongo_log = require('debug')('goftare:mongo');
const User = require('../dao/user_dao').User;


exports.extraInfo = async (req, res, next) => {
	const {
		user_id
	} = req.body;
	try {
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
	} catch (e) {
		next(new Error(`Error in extraInfo controller ${e}`));
	}
};


exports.getProfile = async (req, res, next) => {
	const {
		user_id
	} = req.body;
	try {
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
	} catch (e) {
		next(new Error(`Error in getProfile controller ${e}`));
	}
};

exports.getPsychologistsList	 = async (req, res, next) => {
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