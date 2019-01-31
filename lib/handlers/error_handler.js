const winston = require('../utils/logger');

module.exports = app =>{
// error handler
	app.use(function(err, req, res) {
		res.status(err.status || 500);
		winston.error(`ERROR NAME :‌ ${err.name} - ERROR MESSAGE : ${err.message} - ERROR STACK : ${err.stack} - ERROR CODE : ${err.code} - ERROR STATUS : ${err.status} - ERROR DATE : ${new Date()}`);

		res.json(Object.assign(req.base, {
			result: false,
			message: err.message,
			data: err.stack
		}));
	});

};