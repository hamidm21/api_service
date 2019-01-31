const mongoose = require('mongoose');
const mongo_log = require('debug')('goftare:mongo');
const config = require('../config/config');

mongoose.connect(config.MONGO_HOST,()=> {
	mongo_log('mongodb connected');
});

mongoose.connection.on('connected', ()=> {
	mongo_log('Mongoose connection open to %s ', config.MONGO_HOST );
});
mongoose.connection.on('error', err => {
	mongo_log('Mongoose connection error: %s ',  err);
});
mongoose.connection.on('disconnected', ()=> {
	mongo_log('Mongoose connection disconnected');
});
mongoose.connection.on('open', ()=> {
	mongo_log('Mongoose connection is open');
});
process.on('SIGINT', ()=> {
	mongoose.connection.close(()=> {
		mongo_log('Mongoose connection disconnected through app termination');
		process.exit(0);
	});
});

module.exports = mongoose;
