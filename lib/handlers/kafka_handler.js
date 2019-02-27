const client = require('../utils/kafka').client;
// const producer = require('../utils/kafka').producer;
const Consumer = require('kafka-node').Consumer;
const km = require('kafka-node').KeyedMessage;
const config = require('../config/config');
const chat_controller = require('../controllers/chat_controller');
const Message = require('../dao/chat_dao').Message;
const kafka_log = require('debug')('goftare:kafka');
const error_log = require('debug')('goftare:error');


exports.kafkaInit = async () => {
	const lastOffset = await Message.getLastCommitedOffset();
	kafka_log(lastOffset);
	const consumer = new Consumer(client, [Object.assign({}, config.PAYLOADS, {
		offset: lastOffset
	})], config.CONSUMER_CONFIG);
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


// exports.sendIsNewFalse = function (room_id) {
// 	try {
// 		const keyedMessage = new km('isNew', room_id);
// 		producer.send([Object.assign(config.PAYLOAD, {
// 			messages: [keyedMessage]
// 		})], function (e, result){
// 			if (e) 
// 				throw e;
// 			else
// 				kafka_log('is new has been sent to the chat service'+ result);
// 			return true;
// 		}); 
// 	} catch (e) {
// 		throw e;
// 	}
// };

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