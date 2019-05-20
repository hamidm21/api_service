const db = require('../utils/db');
const moment = require('moment-jalaali');
// const log = require('debug')('payment_service:dao:transaction');

const TransactionSchema = db.Schema({

	authority: {
		type: String,
		required: true
	},
	payment_url: {
		type: String,
		required: true,
	},
	ref_id: {
		type: String,
		default: ''
	},
	subscribe_id: {
		type: String,
		required: true
	},
	user_id: {
		type: String,
		required: true
	},
	psychologist_id: {
		type: String
	},
	room_id: {
		type: String
	},
	is_paid: {
		type: Boolean,
		required: true,
		default: false
	},
	date: {
		type: String,
		required: true,
		default: moment().format('jYYYY/jM/jD')
	},
	time_stamp: {
		type: Date,
		required: true,
		default: new Date().getTime()
	},
	moment: {
		type: String,
		required: true,
		default: moment().format('jYYYY/jMM/jDD HH:mm')
	},
	secretary_id: {
		type: String,
		required: true,
	},
	secretary_room_id: {
		type: String,
		required: true
	},
	subscribe_title: {
		type: String,
		required: true,
	},
	subscribe_price: {
		type: Number,
		required: true,
		default: 0
	},
	euro_price: {
		type: Number,
		required: true,
		default: 0
	},
	is_foreign: {
		type: Boolean,
		required: true,
		default: false
	},
	is_free: {
		type: Boolean,
		required: true,
		default: false
	},
	is_returned: {
		type: Boolean,
		required: true,
		default: false
	},
	extended: {
		type: Boolean,
		default: true
	},
	expire_date: {
		type: String,
		default: ''
	},
	Origin: {
		type: String,
		enum: ['APP', 'WEB']
	}

});


exports.Transaction = db.model('transaction_model', TransactionSchema);