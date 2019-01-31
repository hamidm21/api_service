require('dotenv').config();

const config = {
	PORT: process.env.PORT,
	MONGO_HOST: process.env.MONGO_HOST,
	KAFKA_HOST: process.env.KAFKA_HOST,
	CONSUMER_CONFIG: {
		groupId: 'goftare_chat',//consumer group id, default `kafka-node-group`
		// Auto commit config
		autoCommit: true,
		autoCommitIntervalMs: 5000,
		// The max wait time is the maximum amount of time in milliseconds to block waiting if insufficient data is available at the time the request is issued, default 100ms
		fetchMaxWaitMs: parseInt(process.env.FETCHMAXWAITMS),
		// This is the minimum number of bytes of messages that must be available to give a response, default 1 byte
		fetchMinBytes: parseInt(process.env.FETCHMINBYTES),
		// The maximum bytes to include in the message set for this partition. This helps bound the size of the response.
		fetchMaxBytes: parseInt(process.env.FETCHMAXBYTES),
		// If set true, consumer will fetch message from the given offset in the payloads
		fromOffset: false,
		// If set to 'buffer', values will be returned as raw buffer objects.
		encoding: process.env.ENCODING,
	},
	PRODUCER_CONFIG: {
		requireAcks: parseInt(process.env.REQUIREACKS),
		ackTimeoutMs: parseInt(process.env.ACKTIMEOUTMS),
		partitionerType: parseInt(process.env.PARTITIONERTYPE)
	},
	
	PAYLOADS: {
		topic: process.env.TOPIC,
		offset: 'latest',
		partition: parseInt(process.env.PARTITION) // default 0
	},		// offset: 180, //default 0


	JWT: {
		secret: process.env.JWT_SECRET,
		ref_secret: process.env.JWT_REF_SECRET,
		expire: process.env.JWT_EXPIRE
	}
};

module.exports = config;