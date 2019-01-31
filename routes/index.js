const 
	Chat = require('./Chat'),
	Room = require('./Room'),
	User = require('./User'),
	Auth = require('./Auth');

module.exports = app => {
	app.use('/Chat', Chat);
	app.use('/Room', Room);
	app.use('/User', User);
	app.use('/Auth', Auth);
};