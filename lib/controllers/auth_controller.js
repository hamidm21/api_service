/**
 * @namespace {module} auth_controller
 */
const User = require('../dao/user_dao').User;
const Room = require('../dao/room_dao').Room;
const passhash = require('password-hash');
const forget = require('../utils/forgetPassword');
const config = require('../config/config');
const validator = require('../utils/validator');
const jwt = require('jsonwebtoken');
const log = require('debug')('api:controller:auth');
const elog = require('debug')('api:controller:auth');

/**
 * @memberof auth_controller
 * @function Register 
 * @param {string} username - not a unique string its just a name to identify the user
 * @param {string} password - minimum 6 characters and required
 * @param {string} email - a valid and unique email address
 * @description takes three arguments validates them and saves the user in database if validation is passed
 */
exports.Register = async function (req, res, next) {
	const {
		username,
		password,
		email,
	} = req.body;
	try {
		log({'register data': req.body});
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
			const userAllredyExist = await User.findUserByEmail(email);
			if (userAllredyExist) {
				res.status(400).json(Object.assign({}, req.base, {
					result: false,
					message: 'user allready exist'
				}));
			} else {
				const user = await User.saveUser(email, username, password);
				log({'register result' : user});
				res.json(Object.assign({}, req.base, {
					message: 'successful'
				}));
			}
		}
	} catch (e) {
		elog({'error in register': e});
		next(new Error(`Error in Register function at auth_controller ${e}`));
	}
};

/**
 * @memberof auth_controller
 * @function Login
 * @param {string} password - minimum 5 characters and required
 * @param {string} email - a valid and unique email address
 * @description takes two arguments validates them checks if a user with that credentials exists 
 * then creates the access token and refresh token for the user and returns whether it has any rooms or not 
 * also it will return some of the user information to the client side
 */
exports.Login = async function (req, res, next) {
	const {
		email,
		password
	} = req.body;
	try {
		log({'login data': req.body});
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
			const user = await User.findUserByEmail(email);
			log({'logged in user is': user});
			if (user) {
				const isMatch = await user.comparePassword(password);
				log({isMatch});
				if (isMatch) {
					const roomState = await Room.hasActiveRoom(user._id);
					const payload = {
						id: user._id,
						username: user.username,
						avatar: user.avatar,
						email: user.email,
						accountType: user.type,
						roomState: roomState,
					};
					const accessToken = jwt.sign({
						payload: Object.assign({}, payload, {
							date: new Date(),
						})
					}, config.JWT.secret, {
						expiresIn: config.JWT.expire
					});
					const refreshToken = jwt.sign({
						payload: Object.assign({}, payload, {
							date: new Date(),
						})
					}, config.JWT.ref_secret);
					log({'login result': {accessToken, refreshToken, payload}});
					await User.setRefreshToken(user._id ,refreshToken);
					const userInfo = payload;
					res.json(Object.assign({}, req.base, {
						data: {
							refreshToken,
							accessToken,
							phone_number: user.type === 'Secretary' || user.type === 'Psychologist' ? user.specific_info.phone_number: null, 
							userInfo
						},
						message: ' token and refresh token has been made successfully '
					}));
				} else {
					res.status(401).json(Object.assign({}, req.base, {
						result: false,
						message: 'password is wrong'
					}));
				}
			} else {
				res.status(404).json(Object.assign({}, req.base, {
					result: false,
					message: 'email is not in database'
				}));
			}
		}
	} catch (e) {
		elog({'error in login': e});
		next(new Error(`Error in Login function at auth_controller ${e}`));
	}
};

/**
 * @memberof auth_controller
 * @function refreshToken
 * @param {string} refreshToken - the generated refresh token that is made in login function
 * @description if user access token is expired then this function should be triggered 
 * it checks if there is a user with the same refresh token in the db and if there is 
 * it gives back the new valid access token for that user
 */
exports.refreshToken = async function (req, res, next) {
	const refreshToken = req.body.refreshToken;
	try {
		log({'refreshToken data': req.body});
		const valid = validator.joi.validate(req.body, validator.refreshToken);
		if(valid.error) {
			res.status(406).json(Object.assign({}, req.base, {
				result: false,
				message: 'input is not valid',
				data: valid.data
			}));
		} else {
			const user = await User.findUserByRefreshToken(refreshToken);
			if (user) {
				const roomState = await Room.hasActiveRoom(user._id);
				const payload = {
					id: user._id,
					username: user.username,
					avatar: user.avatar,
					email: user.email,
					accountType: user.type,
					roomState: roomState,
					date: new Date(),
				};
				const accessToken = jwt.sign({
					payload
				}, config.JWT.secret, {
					expiresIn: config.JWT.expire
				});
				log({'refreshToken result': accessToken});
				res.json(Object.assign({}, req.base, {
					data: accessToken,
					message: ' accessToken has been made successfully '
				}));
			} else {
				res.status(404).json(Object.assign({}, req.base, {
					result: false,
					message: 'user credentials not found'
				}));
			}
		}
	} catch (e) {
		elog({'error in refreshToken': e});
		next(new Error(`Error in refreshToken function at auth_controller ${e}`));
	}
};


exports.sendForgetPassword = async function (req, res, next) {
	const {
		email
	} = req.body;
	try {
		const valid = validator.joi.validate({
			email
		}, validator.forgetPassword);
		if (valid.error) {
			res.status(406).json(Object.assign({}, req.base, {
				result: false,
				message: 'input is not valid',
				data: valid.data
			}));
		} else {
			const user = await User.findOne({email});
			if (user) {
				const token = forget.genForgetToken();
				await User.updateOne({email}, {$set: {
					pass_recovery: token,
					pass_recovery_deadline: Date.now() + 3600000
				}});
				const sent = await forget.sendForgetPasswordEmail(email, token);
				log({sent});
				res.json(Object.assign({}, req.base, {
					message: 'success',
				}));
			}else {
				res.status(404).json(Object.assign({}, req.base, {
					message: 'not found',
				}));
			}
		}
	} catch (e) {
		next(new Error(`Error in sendForgetPassword function at auth_controller ${e}`));
	}
};

exports.setForgetPassword = async function (req, res, next) {
	const {
		token,
		password
	} = req.body;
	try {
		const valid = validator.joi.validate({
			token,
			password
		}, validator.setForgetPassword);
		if (valid.error) {
			res.status(406).json(Object.assign({}, req.base, {
				result: false,
				message: 'input is not valid',
				data: valid.data
			}));
		} else {
			const user = await User.findOne({pass_recovery: token});
			if (user) {
				const pass = passhash.generate(password);
				await User.updateOne({pass_recovery: token}, {password: pass});
				res.json(Object.assign({}, req.base, {
					message: 'success',
				}));
			}else {
				res.json(Object.assign({}, req.base, {
					message: 'not found',
				}));
			}
		}
	} catch (e) {
		next(new Error(`Error in sendForgetPassword function at auth_controller ${e}`));
	}
};