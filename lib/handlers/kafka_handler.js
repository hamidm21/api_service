const client = require('../utils/kafka').client;
const Consumer = require('kafka-node').Consumer;
const config = require('../config/config');
const chat_controller = require('../controllers/chat_controller');
const Message = require('../dao/chat_dao').Message;
const kafka_log = require('debug')('goftare:kafka');


exports.kafkaInit = async () => {
	const lastOffset = await Message.getLastCommitedOffset();
	kafka_log(lastOffset);
	const consumer = new Consumer(client, [Object.assign({}, config.PAYLOADS, {offset: lastOffset})], config.CONSUMER_CONFIG);
	consumer.on('message', message => {
		kafka_log(message);
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
};

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