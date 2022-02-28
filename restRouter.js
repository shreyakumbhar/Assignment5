/**
 * This router serves to access the articles that are assigned to a customer.
 * New articles can only be created with admin credentials.
 * An object of all articles can ge accessed without any credentials.
 */
const express = require('express');
const bodyParser = require('body-parser');
const auth = require('../auth/auth');
const Article = require('../models/article');

const router = express.Router();
router.use(bodyParser.json());


router.route('/')

  // Requests to fetch all existing articles are allowed to everyone.
  .get((req, res, next) => {
    Article.find({})
      .then((articles) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(articles);
      })
      .catch((err) => next(err));
  })

  /**
  * Only Admins can add new articles. Articles should be unique. To avoid that the user adds
  * the same article several times. It will be checked on its uniqueness
  */
  .post(auth.verifyUser, auth.verifyAdmin, isAUniqueArticle, (req, res, next) => {
    Article.create(req.body)
      .then((newArticle) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(newArticle);
      })
      .catch((err) => next(err));
  })
  .put(auth.verifyUser, auth.verifyAdmin, (req, res, next) => {
    res.statusCode = 405;
    res.end('PUT method not supported by /articles');
  })

  // Dangerous! Delete method that deletes ALL articles
  .delete(auth.verifyUser, auth.verifyAdmin, (req, res, next) => {
    Article.deleteMany({})
      .then((successMessage) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(successMessage);
      })
      .catch((err) => next(err));
  });

// Routes to access individual articles
router.route('/:articleId')
  .get((req, res, next) => {
    Article.find({ _id: req.params.articleId })
      .then((article) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(article);
      })
      .catch((err) => next(err));
  })
  .post(auth.verifyUser, auth.verifyAdmin, (req, res, next) => {
    res.statusCode = 405;
    res.end('PUT method not supported by /articles/' + req.params.articleId);
  })
  .put(auth.verifyUser, auth.verifyAdmin, (req, res, next) => {
    Article.findByIdAndUpdate(req.params.articleId, { $set: req.body }, { new: true })
      .then((updatedArticle) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(updatedArticle);
      })
      .catch((err) => next(err));
  })
  .delete(auth.verifyUser, auth.verifyAdmin, (req, res, next) => {
    Article.findByIdAndDelete(req.params.articleId)
      .then((successMessage) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(successMessage);
      })
      .catch((err) => next(err));
  })


/**
 * Middleware to check whether the requests data contains a new article. Otherwise the
 * request will be rejected.
 * @function isAUniqueArticle
 * @param {Object} req 
 * @param {Object} res 
 * @param {Function} next 
 * @returns {Promise.<Function>} Calls the next() function
 * @throws Will throw an error and set the status code to 403 when an already existing
 * article is in the request's body
 */
function isAUniqueArticle(req, res, next) {
  Article.find({ name: req.body.name })
    .then((article) => {
      if (article.length === 0 || !article) {
        return next();
      }
      else {
        err = new Error('An article with the name ' + req.body.name + ' already exists');
        err.status = 403;
        return next(err);

      }
    })
    .catch((err) => next(err));
}

module.exports = router;