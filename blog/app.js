var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session=require('express-session');
var MongoStore=require('connect-mongo')(session);
var multer=require('multer');
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, __dirname+'/public/uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});

var upload = multer({ storage: storage });

var routers = require('./routes/index');
var settings=require('./db/settings');
var flash=require('connect-flash');
var fs=require('fs');
var accessLog=fs.createWriteStream('access.log',{flags:'a'});
var errorLog=fs.createWriteStream('error.log',{flags:'a'});
var app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(flash())


app.use(session({
  secret:settings.cookieSecret,//一个String类型字符串，作为服务器端生成session的签名，与cookieParser中的一致 
  saveUninitialized:false,//在存储一些新数据之前，不创建session
  resave:false,//如果没有发生任何修改，不存储session
  store:new MongoStore({
    url:settings.url,
    touchAfter:24*3600//24小时内，无论发多少个请求,session之后被更新一次
  })
}));

app.use(upload.array('img',5));
app.use(logger('dev'));
app.use(logger({stream:accessLog}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use((err,req,res,next)=>{
  var meta='['+new Date()+']'+req.url+'\n';
  errorLog.write(meta,err.stack+'\n');
  next();
});

routers(app);

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
