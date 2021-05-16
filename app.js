var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var fileUpload=require('express-fileupload')
const session = require('express-session')
var hbs=require('express-handlebars')
var userRouter = require('./routes/user');
var adminRouter = require('./routes/admin');
const mongoose = require("mongoose");

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine('hbs',hbs({extname:'hbs',defaultLayout:'layout',layoutDir:__dirname+'/views/layout/',partialDir:__dirname+'/views/layout/'}));
app.use(fileUpload())
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({secret:"key",cookie:{maxAge:600000}}))
app.use('/', userRouter);
app.use('/admin', adminRouter);
mongoose.connect(
  "mongodb+srv://mubaris:3887@cluster0.lgafj.mongodb.net/shop-cart?retryWrites=true&w=majority",
  () => {
    console.log("db is ok");
  }
);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
