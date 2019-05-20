const client = require('../utils/kafka').client;
const producer = require('../utils/kafka').producer;
const Consumer = require('kafka-node').Consumer;
const km = require('kafka-node').KeyedMessage;
const config = require('../config/config');
const chat_controller = require('../controllers/chat_controller');
const room_controller = require('../controllers/room_controller');
const Message = require('../dao/chat_dao').Message;
const log = require('debug')('api:handler:kafka');
const elog = require('debug')('api:error:handler:kafka');


exports.kafkaInit = async () => {
	const lastOffset = await Message.getMaxCommitedOffset();
	log(lastOffset);
	const consumer = new Consumer(client, [Object.assign({}, config.PAYLOADS, {
		offset: lastOffset
	})], config.CONSUMER_CONFIG);
	consumer.on('message', message => {
		log(message);
		switch (message.key) {
		case 'newMessage':
			chat_controller.saveMessage(message);
			log('newMessage');
			break;
		case 'readMessage':
			chat_controller.readMessage(message);
			log('readMessage');
			break;
		case 'notNew':
			room_controller.notNew(message);
			break;
		case 'choosePsychologist':
			room_controller.choosePsychologist(message);
			break;
		case 'expireTransaction':
			room_controller.expireTransaction(message);
			break;
		default:
			break;
		}
	});
};


exports.registerSms = async (phone_number, template, username) => {
	try {
		const keyedMessage = new km('registerSms', JSON.stringify({phone_number, template, username}));
		producer.send([Object.assign({}, config.PAYLOAD, {
			topic: 'notify',
			messages: [keyedMessage]
		})], function (err, result) {
			if (err) {
				elog({
					'error in createRoom producer': err
				});
				Promise.reject(err);
			} else {
				Promise.resolve(result);
			}
		});
	} catch (e) {
		Promise.reject(e);
	}
};


exports.createTopic = function (req, res) {
	try {
		client.createTopics([{
			topic: req.body.topic,
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
	} catch (e) {
		res.status(500).json({
			result: false
		});
	}
};