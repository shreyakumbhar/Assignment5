const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');
const config = require('./config');
const passport = require('passport');

// Routers
const usersRouter = require('./routes/userRouter');
const articlesRouter = require('./routes/articleRouter');
const customersRouter = require('./routes/customerRouter');

// These are needed for Mongoose's depreciation warnings.
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

// MongoDB set up
const mongoUrl = config.mongoUrl;
const connect = mongoose.connect(mongoUrl);

connect.then((db) => {
  console.log('Connected correctly to the database');
}, (err) => { console.log(err); });

// Express set up
const app = express();

// Making sure that only HTTPS is used for requests.
app.all('*', (req, res, next) => {
  if (req.secure) {
    return next();
  }
  else {
    res.redirect(307, 'https://' + req.hostname + ':' + app.get('secPort') + req.url);
  }
});

// Middleware
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize());

// Routes
app.use('/users', usersRouter);
app.use('/customers', customersRouter);
app.use('/articles', articlesRouter);

// Catch 404 and forward them to the error handler
app.use((req, res, next) => {
  next(createError(404));
});

// Error handler
app.use((err, req, res, next) => {
  
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;