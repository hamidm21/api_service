const router = require('express').Router();
const controller = require('../lib/controllers/article_controller');

router.post('/getArticles', controller.getArticles);

router.post('/getArticle', controller.getArticle);

router.get('/getCategories', controller.getCategories);

router.post('/search', controller.search);

module.exports = router;