const User = require('../dao/user_dao').User;
const Auth = require('../dao/auth_dao').Auth;
const Room = require('../dao/room_dao').Room;
const Psycho = require('../dao/psychologist_dao').Psycho;
const config = require('../config/config');
const winston = require('../utils/logger');
const validator = require('../utils/validator');
const jwt = require('jsonwebtoken');
const auth_log = require('debug')('goftare:auth');

exports.Register = async function (req, res, next) {
	const {
		username,
		password,
		email,
	} = req.body;
	try {
		const valid = validator.joi.validate({
			username,
			password,
			email
		}, validator.Register);
		if (valid.error) {
			res.status(406).json(Object.assign(req.base, {
				result: false,
				message: 'input is not valid',
				data: valid.error
			}));
		} else {
			const user = await User.saveUser(email, username);
			const auth = await Auth.saveAuth(email, password);
			if (user && auth) {
				auth_log(user + '\n.....new login.....\n' + auth);
				res.json(Object.assign(req.base, {
					message: 'successful'
				}));
			} else {
				res.status(500).json(Object.assign(req.base, {
					result: false,
					message: 'Register not able to save user and authentication data'
				}));
				winston.info('Register not able to save user and authentication data ..... auth_controller ..... Register');
			}
		}
	} catch (e) {
		next(new Error(`Error in Register function at auth_controller ${e}`));
	}
};


exports.Login = async function (req, res, next) {
	const {
		email,
		password
	} = req.body;
	try {
		const valid = validator.joi.validate({
			email,
			password
		}, validator.Login);
		if (valid.error) {
			res.status(406).json(Object.assign(req.base, {
				result: false,
				message: 'input is not valid',
				data: valid.error
			}));
		} else {
			if (email && password) {
				const user = await User.findUserByIdentity(email);
				const psycho = await Psycho.findPsychologistByIdentity(email);
				const credentials = user || psycho;
				const auth = await Auth.findAuthByEmail(email);
				auth_log(credentials+'.....'+auth);
				if (credentials && auth) {
					const isMatch = await auth.comparePassword(password);
					if (isMatch) {

						const roomState = await Room.hasActiveRoom(credentials._id);
						const payload = {
							id: credentials._id,
							username: credentials.username,
							email: credentials.email,
							accountType: auth.type,
							roomState: roomState
						};
						const accessToken = jwt.sign({
							payload
						}, config.JWT.secret, {
							expiresIn: config.JWT.expire	
						});

						const refreshToken = jwt.sign({
							payload
						}, config.JWT.ref_secret);

						if (accessToken && refreshToken) {
							auth_log(accessToken+ '\n.....new credentials.....\n'+ refreshToken);
							await Auth.updateOne({
								username: credentials.username
							}, {
								$set: {
									refreshToken: refreshToken
								}
							});

							res.json(Object.assign(req.base, {
								data: {
									refreshToken,
									accessToken
								},
								message: ' token and refresh token has been made successfully '
							}));

						} else {
							res.status(500).json(Object.assign(req.base, {
								result: false,
								message: 'user credentials not made'
							}));
							winston.info('user credentials not made ..... auth_controller ..... Login');
						}
					} else {
						res.status(401).json(Object.assign(req.base, {
							result: false,
							message: 'user credentials not correct'
						}));
						winston.info('user credentials not correct ..... auth_controller ..... Login');
					}
				} else {
					res.status(406).json(Object.assign(req.base, {
						result: false,
						message: 'user credentials not found'
					}));
					winston.info('user credentials not found ..... auth_controller ..... Login');
				}
			} else {
				res.status(500).json(Object.assign(req.base, {
					result: false,
					message: 'user credentials not in database'
				}));
				winston.info('user credentials not in database ..... auth_controller ..... Login');
			}

		}
	} catch (e) {
		next(new Error(`Error in Login function at auth_controller ${e}`));
	}
};


exports.refreshToken = async function (req, res, next) {
	const refreshToken = req.body.refreshToken;
	try {
		if (refreshToken) {
			const user = await User.findUserByRefreshToken(refreshToken);
			if (user) {
				const payload = {
					username: user.username,
					email: user.email,
					accountType: user.accountType
				};
				const accessToken = jwt.sign({
					payload
				}, config.JWT.secret, {
					expiresIn: config.JWT.expire
				});
				if (accessToken) {
					res.json(Object.assign(req.base, {
						data: accessToken,
						message: ' accessToken has been made successfully '
					}));
				} else {
					res.status(500).json(Object.assign(req.base, {
						result: false,
						message: 'user credentials not made'
					}));
					winston.info('user credentials not made ..... auth_controller ..... refreshToken');
				}
			} else {
				res.status(404).json(Object.assign(req.base, {
					result: false,
					message: 'user credentials not found'
				}));
				winston.info('user credentials not found ..... auth_controller ..... refreshToken');
			}
		} else {
			res.status(500).json(Object.assign(req.base, {
				result: false,
				message: 'user credentials not available'
			}));
			winston.info('user credentials not available ..... auth_controller ..... refreshToken');
		}

	} catch (e) {
		next(new Error(`Error in refreshToken function at auth_controller ${e}`));
	}
};