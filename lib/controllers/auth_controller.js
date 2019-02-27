/**
 * @namespace {module} auth_controller
 */
const User = require('../dao/user_dao').User;
const Room = require('../dao/room_dao').Room;
const config = require('../config/config');
const winston = require('../utils/logger');
const validator = require('../utils/validator');
const jwt = require('jsonwebtoken');
const auth_log = require('debug')('goftare:auth');

/**
 * @memberof auth_controller
 * @function Register 
 * @param {string} username - not a unique string its just a name to identify the user
 * @param {string} password - minimum 6 characters and required
 * @param {string} email - a valid and unique email address
 * @description takes three arguments validates them and saves the user in database if validate is passed
 */
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
			res.status(406).json(Object.assign({}, req.base, {
				result: false,
				message: 'input is not valid',
				data: valid.error
			}));
		} else {
			const user = await User.saveUser(email, username, password);
			if (user) {
				auth_log('..........new Login..........\n' + user);
				res.json(Object.assign({}, req.base, {
					message: 'successful'
				}));
			} else {
				res.status(500).json(Object.assign({}, req.base, {
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

/**
 * @memberof auth_controller
 * @function Login
 * @param {string} password - minimum 6 characters and required
 * @param {string} email - a valid and unique email address
 * @description takes two arguments validates them checks if a user with that credentials exists 
 * and creates the access token and refresh token for the user and returns the active rooms for that user if there was any
 * and also returns the payload to the client side
 */
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
			res.status(406).json(Object.assign({}, req.base, {
				result: false,
				message: 'input is not valid',
				data: valid.error
			}));
		} else {
			if (email && password) {
				const user = await User.findUserByEmail(email);
				auth_log(user);
				if (user) {
					const isMatch = await user.comparePassword(password);
					if (isMatch) {

						const roomState = await Room.hasActiveRoom(user._id);
						const payload = {
							id: user._id,
							username: user.username,
							avatar: user.avatar,
							email: user.email,
							accountType: user.type,
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
							auth_log(accessToken + '\n.....new credentials.....\n' + refreshToken);
							await User.updateOne({
								username: user.username
							}, {
								$set: {
									refreshToken: refreshToken
								}
							});

							const userInfo = payload;
							res.json(Object.assign({}, req.base, {
								data: {
									refreshToken,
									accessToken,
									userInfo
								},
								message: ' token and refresh token has been made successfully '
							}));

						} else {
							res.status(500).json(Object.assign({}, req.base, {
								result: false,
								message: 'user credentials not made'
							}));
							winston.info('user credentials not made ..... auth_controller ..... Login');
						}
					} else {
						res.status(401).json(Object.assign({}, req.base, {
							result: false,
							message: 'user credentials not correct'
						}));
						winston.info('user credentials not correct ..... auth_controller ..... Login');
					}
				} else {
					res.status(406).json(Object.assign({}, req.base, {
						result: false,
						message: 'user credentials not found'
					}));
					winston.info('user credentials not found ..... auth_controller ..... Login');
				}
			} else {
				res.status(500).json(Object.assign({}, req.base, {
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

/**
 * @memberof auth_controller
 * @function refreshToken
 * @param {string} refreshToken - the generated refresh token that is made in login function
 * @description if user access token is expired then this function should be triggered 
 * it checks if there is a user with the same refresh token in the db and if there is it gives back the new valid access token for that user
 */
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
					res.json(Object.assign({}, req.base, {
						data: accessToken,
						message: ' accessToken has been made successfully '
					}));
				} else {
					res.status(500).json(Object.assign({}, req.base, {
						result: false,
						message: 'user credentials not made'
					}));
					winston.info('user credentials not made ..... auth_controller ..... refreshToken');
				}
			} else {
				res.status(404).json(Object.assign({}, req.base, {
					result: false,
					message: 'user credentials not found'
				}));
				winston.info('user credentials not found ..... auth_controller ..... refreshToken');
			}
		} else {
			res.status(500).json(Object.assign({}, req.base, {
				result: false,
				message: 'user credentials not available'
			}));
			winston.info('user credentials not available ..... auth_controller ..... refreshToken');
		}

	} catch (e) {
		next(new Error(`Error in refreshToken function at auth_controller ${e}`));
	}
};