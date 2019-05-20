const
	Chat = require('./Chat'),
	Room = require('./Room'),
	User = require('./User'),
	Article = require('./Article'),
	Auth = require('./Auth'),
	Kafka = require('./Kafka');

module.exports = app => {
	app.use('/Chat', Chat);
	app.use('/Room', Room);
	app.use('/User', User);
	app.use('/Auth', Auth);
	app.use('/Article', Article);
	app.use('/Kafka', Kafka);
};