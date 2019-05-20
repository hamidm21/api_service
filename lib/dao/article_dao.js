const mongo = require('../utils/db');
const jmoment = require('moment-jalaali');
const log = require('debug')('api:dao:article');

const ArticleSchema = mongo.Schema({

	writer_email: {
		type: String,
		required: true
	},
	writer_username: {
		type: String,
		required: true,
	},
	title: {
		type: String,
		trim: true
	},
	image: {
		type: String,
		required: true,
	},
	tags: {
		type: [String]
	},
	category: {
		type: String,
		required: true,
		//TODO: add enum here
	},
	text: {
		type: String,
		required: true
	},
	date: {
		type: String,
		required: true,
		default: jmoment().format('jYYYY/jM/jD')
	},
	description: {
		type: String,
		required: true
	},
	link_title: {
		type: String
	},
	moment: {
		type: String,
		default: jmoment().format('jYYYY/jMM/jDD/ HH:mm:ss')
	}

});


ArticleSchema.index({
	tags: 'text',
	title: 'text',
	category: 'text',
	text: 'text'
});
ArticleSchema.statics = {

	getArticles: function (page, limit, category) {
		const skipped = page * limit;
		if (category) {
			return this.find({
				category
			}, {
				writer_username: 1,
				title: 1,
				image: 1,
				tags: 1,
				category: 1,
				description: 1,
				date: 1,
			})
				.sort({
					'_id': -1
				})
				.skip(skipped)
				.limit(limit);
		} else {
			return this.find({}, {
				writer_username: 1,
				title: 1,
				image: 1,
				tags: 1,
				category: 1,
				description: 1,
				date: 1,
			})
				.sort({
					'_id': -1
				})
				.skip(skipped)
				.limit(limit);

		}
	},
	getArticle: function (_id) {
		return this.findOne({
			_id
		}, {
			writer_username: 1,
			title: 1,
			image: 1,
			tags: 1,
			text: 1,
			category: 1,
			description: 1,
			date: 1,
		});
	},
	search: function (page, limit, phrase) {
		const skipped = page * limit;
		return this.find({
			$text: {
				$search: phrase
			}
		})
			.skip(skipped)
			.limit(limit);
	}
};

exports.Article = mongo.model('articles_model', ArticleSchema);