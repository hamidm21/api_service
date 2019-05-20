require('dotenv').config();

const config = {
	PORT: process.env.PORT,
	MONGO_HOST: process.env.MONGO_HOST,
	KAFKA_HOST: process.env.KAFKA_HOST,
	TOPICS: {
		messaging: process.env.TOPIC,
		notification: process.env.NOTIFY_TOPIC
	},
	CONSUMER_CONFIG: {
		groupId: 'goftare_chat', //consumer group id, default `kafka-node-group`
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
		fromOffset: true,
		// If set to 'buffer', values will be returned as raw buffer objects.
		encoding: process.env.ENCODING,
	},
	PRODUCER_CONFIG: {
		requireAcks: parseInt(process.env.REQUIREACKS),
		ackTimeoutMs: parseInt(process.env.ACKTIMEOUTMS),
		partitionerType: parseInt(process.env.PARTITIONERTYPE)
	},

	PRODUCER_PAYLOAD: {
		topic: process.env.TOPIC,
		messages: [], // multi messages should be a array, single message can be just a string or a KeyedMessage instance
		key: 'message', // string or buffer, only needed when using keyed partitioner
		partition: 0, // default 0
		attributes: 1, // default: 0
		timestamp: Date.now() // <-- defaults to Date.now() (only available with kafka v0.10 and KafkaClient only)
	},

	PAYLOADS: {
		topic: process.env.TOPIC,
		offset: 857, //default 0
		partition: parseInt(process.env.PARTITION) // default 0
	},
	PAYLOAD: {
		topic: process.env.TOPIC,
		messages: [], // multi messages should be a array, single message can be just a string or a KeyedMessage instance
		key: 'message', // string or buffer, only needed when using keyed partitioner
		partition: 0, // default 0
		attributes: 1, // default: 0
		timestamp: Date.now() // <-- defaults to Date.now() (only available with kafka v0.10 and KafkaClient only)
	},
	JWT: {
		secret: process.env.JWT_SECRET,
		ref_secret: process.env.JWT_REF_SECRET,
		expire: process.env.JWT_EXPIRE
	},
	AUTOMATED_MESSAGE: {
		text: 'آغاز گفتگو',
		room_id: '',
		type: 'notify',
		timestamp: '',
		moment: '',
		sender_id: '',
		creator_id: '',
		is_read: 1,
		message_id: '',
		incremental_id: 1
	},
	SECRETARY_MSG: username => {
		return Promise.resolve(`سلام من ${username} هستم کارشناس سایت گفتاره
		من اینجام تا شما رو به روانشناس مناسب وصل کنم همچنین در خصوص 
		عملکرد سایت به سوال های شما پاسخ بدم 
		قبل از هرچیز اگه دوست داری بهم بگو اسمت چیه و چند سالته ؟ `);
	},
	PSYCHOLOGIST_MSG: username => {
		return Promise.resolve(` سلام من ${username} هستم 
		خوشحالم از اینکه قراره به عنوان روانشناس در کنارت باشم 
		فرایند مشاوره به اینصورته که اول با هم 
		زمان جلسات مشاوره رو هماهنگ میکنیم 
		بعد در زمان های مشخص شده جلسات مشاوره برگزار میشه
		من در حال حاضر آنلاین نیستم ولی در اسرع وقت
		آنلاین میشم و زمان جلسات رو هماهنگ میکنیم `);
	},
	SECRETARY_NIGHT_MSG: username => {
		return Promise.resolve(`سلام من ${username} هستم کارشناس سایت گفتاره
		من اینجام تا شما رو به روانشناس مناسب وصل کنم همچنین در خصوص 
		عملکرد سایت به سوال های شما پاسخ بدم 
		من از ساعت ۱ تا ۸ صبح آنلاین نیستم 
		لطفا از ساعت ۸ صبح به بعد دوباره به سایت سر بزن `);
	},
	EXPIRED_MESSAGE: () => {
		return Promise.resolve(`دوست عزیز مدت زمان مشاورت تموم شده 
		و برای اینکه بتونیم مشاوره رو با هم ادامه بدیم 
		لازمه که تمدید کنی برای تمدید اشتراک 
		روی دکمه آبی رنگ پایین صفحه بزن `);
	}
};

module.exports = config;