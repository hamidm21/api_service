// const User = require('../dao/user_dao').User;
const User = require('../dao/user_dao').User;
const config = require('../config/config');
const winston = require('../utils/logger');
// const guard_log = require('debug')('goftare:guard');
const jwt = require('jsonwebtoken');

exports.userGuard = (req, res, next) => {
	const token = req.body.accessToken;
	try {
		if (token) {
			jwt.verify(token, config.JWT.secret, async function (err, decoded) {
				if (err) {
					switch (err.name) {
					case 'TokenExpiredError':
						res.status(401).json(Object.assign({}, req.base, {
							result: false,
							message: 'EXPIRED',
							data: err
						}));
						winston.debug('credential_expired' + token);
						break;
					case 'JsonWebTokenError':
						res.status(401).json(Object.assign({}, req.base, {
							result: false,
							message: 'ERROR',
							data: err
						}));
						winston.info('credential_error' + token);
						break;
					case 'NotBeforeError':
						res.status(401).json(Object.assign({}, req.base, {
							result: false,
							message: 'ERROR',
							data: err
						}));
						winston.info('credential_before' + token);
						break;
					}
				} else {
					const user = await User.findUserByEmail(decoded.payload.email);
					if (user.blocked) {
						res.status(401).json(Object.assign({}, req.base, {
							result: false,
							message: 'BLOCKED'
						}));
						winston.info('credential_blocked' + token);
					} else {
						req.credentials = {
							accessToken: token
						};
						next();
					}
				}
			});
		} else
			res.status(400).json(Object.assign({}, req.base, {
				result: false,
				message: 'EMPTY'
			}));

	} catch (e) {
		next(new Error(`Error in userGuard ${e}`));
	}
};


// exports.adminGuard = async (req, res, next) => {
//     let token = req.body.token;
//     try {

//         if (token) {
//             jwt.verify(token, process.env.SECRET, function (err, decoded) {
//                 if (err) {
//                     res.status(401).json(Object.assign({}, req.base, {
//                         result: false,
//                         message: "EXPIRED",
//                         data: err
//                     }))
//                 } else {
//                     let user = await User.findUserByUsername(decoded.payload.username);
//                     console.log({
//                         user
//                     })
//                     if (user.accountType !== "admin") {
//                         res.status(401).json(Object.assign({}, req.base, {
//                             result: false,
//                             message: "NOT_ADMIN"
//                         }))
//                     } else
//                         next()
//                 }
//             })
//         } else
//             res.status(400).json(Object.assign({}, req.base, {
//                 result: false,
//                 message: "EMPTY"
//             }))
//     } catch (e) {
//         next(new serverError(e.code, e.message, e.Fa_Message, e.status))
//     }

// }