const Article = require('../dao/article_dao').Article;
const Category = require('../dao/article_dao').Category;
const validator = require('../utils/validator');
const log = require('debug')('api:controller:article');
const elog = require('debug')('api:error:controller:article');


exports.getArticles = async (req, res, next) => {
	const {
		page,
		limit,
		category
	} = req.body;
	try {
		const valid = validator.joi.validate(req.body, validator.getArticles);
		if (valid.error) {
			res.status(406).json(Object.assign({}, req.base), {
				result: false,
				message: 'input is not valid',
				data: valid.error
			});
		} else {
			const articles = Article.getArticles(page, limit, category);
			res.json(Object.assign({}, req.base, {
				message: 'got articles',
				data: articles
			}));
		}
	} catch (e) {
		next(new Error(e));
	}
};


exports.getArticle = async (req, res, next) => {
	const {
		article_id,
	} = req.body;
	try {
		const valid = validator.joi.validate(req.body, validator.getArticle);
		if (valid.error) {
			res.status(406).json(Object.assign({}, req.base, {
				result: false,
				message: 'input is not valid',
				data: valid.error
			}));
		} else {
			const article = Article.getArticle(article_id);
			res.json(Object.assign({}, req.base, {
				message: 'article is found',
				data: article
			}));
		}
	} catch (e) {
		next(new Error(e));
	}
};

exports.getCategories = async (req, res, next) => {
	try {
		const categories = Category.findOne({});
		res.json(Object.assign({}, req.base, {
			message: 'categories are found',
			data: categories
		}));
	} catch (e) {
		next(new Error(e));
	}
};

exports.search = async (req, res, next) => {
	const {
		page,
		limit,
		phrase
	} = req.body;
	try {
		const valid = validator.joi.validate(req.body, validator.search);
		if (valid.error) {
			res.status(406).json(Object.assign({}, req.base, {
				result: false, 
				message: 'input is not valid',
				data: valid.error
			}));
		} else {
			const articles = Article.search(page, limit, phrase);
			res.json(Object.assign({}, req.body, {
				message: 'search is done',
				data: articles
			}));
		}
	} catch (e) {
		next(new Error(e));
	}
};