const express = require('express');
const bodyParser = require('body-parser');
const auth = require('../auth/auth');
const Customer = require('../models/customer');
const mongoose = require('mongoose');

const router = express.Router();

router.use(bodyParser.json());

// routes to access all customers
router.route('/')
    .get(auth.verifyUser, (req, res, next) => {
        Customer.find({})
            .then((customers) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(customers);
            })
            .catch((err) => next(err));
    })
    //Only Users can add new customers.
    //The uniqueness of a customer will be checked through a custom function
    .post(auth.verifyUser, (req, res, next) => {
        Customer.create(req.body)
            .then((newCustomer) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(newCustomer);
            })
            .catch((err) => next(err));
    })
    .put(auth.verifyUser, (req, res, next) => {
        res.statusCode = 405;
        res.end('PUT method not supported by /customers');
    })
    //Dangerous delete method that deletes ALL customers
    .delete(auth.verifyUser, auth.verifyAdmin, (req, res, next) => {
        Customer.deleteMany({})
            .then((successMessage) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(successMessage);
            })
            .catch((err) => next(err));
    });

// routes to access individual customers and edit them
router.route('/:customerId')
    .get((req, res, next) => {
        Customer.find({ _id: req.params.customerId })
            .then((customer) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(customer);
            })
            .catch((err) => next(err));
    })
    .post(auth.verifyUser, (req, res, next) => {
        res.statusCode = 405;
        res.end('POST method not supported by /customers/' + req.params.customerId);
    })
    .put(auth.verifyUser, (req, res, next) => {
        Customer.findByIdAndUpdate(req.params.customerId, { $set: req.body }, { new: true })
            .then((updatedCustomer) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(updatedCustomer);
            })
            .catch((err) => next(err));
    })
    .delete(auth.verifyUser, auth.verifyAdmin, (req, res, next) => {
        Customer.findByIdAndDelete(req.params.customerId)
            .then((successMessage) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(successMessage);
            })
            .catch((err) => next(err));
    })

// routes to access all orders of individual customers
router.route('/:customerId/orders/')
    .get(auth.verifyUser, (req, res, next) => {
        Customer.findById(req.params.customerId)
            .then((customer) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(customer.orders);
            })
    })
    .post(auth.verifyUser, (req, res, next) => {
        Customer.findById(req.params.customerId)
            .then((customer) => {
                // the Json string of the req.body.article needs to be transformed into a mongoDB objectId before pushing it into the entry
                req.body.article = mongoose.Types.ObjectId(req.body.article);
                customer.orders.push(req.body);
                // in case of indirect manipulation of the document through a variable we need to save the result!
                customer.save()
                    .then((newOrder) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(newOrder);
                    })
                    .catch((err) => next(err));
            })
            .catch((err) => next(err));
    })
    .put(auth.verifyUser, (req, res, next) => {
        res.statusCode = 405;
        res.end('PUT method not supported by /customers/' + req.params.customerId + '/orders/');
    })
    .delete(auth.verifyUser, auth.verifyAdmin, (req, res, next) => {
        Customer.findByIdAndUpdate(req.params.customerId, { $set: { orders: [] } }, { new: true })
            .then((updatedCustomer) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(updatedCustomer);
            })
            .catch((err) => next(err));
    });

// routes to access one order of an individual customer
router.route('/:customerId/orders/:orderId')
    .get(auth.verifyUser, (req, res, next) => {
        Customer.findById(req.params.customerId)
            .then((customer) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(customer.orders.id(req.params.orderId));
            })
            .catch((err) => next(err));
    })
    .post((auth.verifyUser), (req, res, next) => {
        res.statusCode = 405;
        res.end('POST method not supported by /customers/' + req.params.customerId + '/orders/' + req.params.orderId);
    })
    .put(auth.verifyUser, (req, res, next) => {
        Customer.findById(req.params.customerId)
            .then((customer) => {
                if (req.body.deliveryStatus) {
                    customer.orders.id(req.params.orderId).deliveryStatus = req.body.deliveryStatus;
                }
                if (req.body.article) {
                    // See the explanation above regarding the mongoose usage
                    req.body.article = mongoose.Types.ObjectId(req.body.article);
                    customer.orders.id(req.params.orderId).article = req.body.article;
                }
                customer.save()
                    .then((updatedCustomer) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(updatedCustomer.orders.id(req.params.orderId));
                    })
                    .catch((err) => next(err));
            })
            .catch((err) => next(err));
    })
    .delete(auth.verifyUser, auth.verifyAdmin, (req, res, next) => {
        Customer.findById(req.params.customerId)
            .then((customer) => {
                customer.orders.pull(req.params.orderId)
                customer.save()
                    .then((updatedCustomer) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(updatedCustomer.orders);
                    })
                    .catch((err) => next(err));
            })
            .catch((err) => next(err));
    });

module.exports = router;