// const chat_controller = require('../controllers/chat_controller');
const config = require('../config/config');
// const kafka_log = require('debug')('goftare:kafka');
// const winston = require('./logger');
const kafka = require('kafka-node');
// const Consumer = kafka.Consumer;
// const Producer = kafka.Producer;
const Client = new kafka.KafkaClient({kafkaHost: config.KAFKA_HOST});
// const offset = new kafka.Offset(Client);
// const consumer = new Consumer(Client, [ config.PAYLOADS ], config.CONSUMER_CONFIG);
// const producer = new Producer(Client, config.PRODUCER_CONFIG);


// offset.fetchCommitsV1('goftare_chat', [{
// 	topic: 'CHAT',
// 	partition: 0
// }], function (e, lastCommitedOffset) {
// 	if (e) {
// 		winston.error(`error in  - ${e.status || 500} - ${e.message} - ${e.stack} - ${new Date()}`);
// 	} else
// 		kafka_log(lastCommitedOffset.MESSAGES[0]);
// });

// producer.on('ready', ()=> {
// 	kafka_log('kafka is up and running');
// });


// consumer.on('error', (error)=> {
// 	winston.error(`kafka connection has errors -----> ${error}`);
// });

// process.on('SIGINT', ()=> {
// 	consumer.close(true, function () {
// 		process.exit();
// 	});
// });

// consumer.on('message', message => {
// 	kafka_log(message);
// 	chat_controller.saveMessage(message);
// });

// consumer.on('offsetOutOfRange', function (topic) {
// 	kafka_log(`offset Out of range ${topic}`);
// 	// topic.maxNum = 2;
// 	// offset.fetch([topic], function (err, offsets) {
// 	// 	if (err) {
// 	// 		winston.error(`kafka has error -----> ${err}`);
// 	// 	}
// 	// 	const min = Math.min.apply(null, offsets[topic.topic][topic.partition]);
// 	// 	consumer.setOffset(topic.topic, topic.partition, min);
// 	// });
// });

exports.client = Client;
