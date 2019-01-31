const {client, consumer} = require('../utils/kafka');
const config = require('../config/config');
const chat_controller = require('../controllers/chat_controller');
const kafka_log = require('debug')('goftare:kafka');

consumer.on('message', (message) => {
	switch (message.key) {
	case 'newMessage':
		chat_controller.saveMessage(message);
		kafka_log('newMessage');
		break;
	case 'readMessage':
		chat_controller.readMessage(message);
		kafka_log('readMessage');
		break;
	default:
		break;
	}
});

exports.createTopic = function (req, res) {
	client.createTopics([{
		topic: config.TOPIC,
		partitions: 2,
		replicationFactor: 1
	}], (error, result) => {
		if (error)
			throw error;
		else if (result)
			res.json({
				result: result
			});
		else
			res.json({
				result: 'seccesfull'
			});
	});
};