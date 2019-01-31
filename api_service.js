const 
	express = require('express'),
	path = require('path'),
	compression = require('compression'),
	cookieParser = require('cookie-parser'),
	winston = require('./lib/utils/logger'),
	morgan = require('morgan'),
	Init = require('./lib/utils/Init'),
	Routes = require('./routes/index'),
	// errorHandler = require('./lib/handlers/error_handler'),
	app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

//MiddleWares
app.use(morgan('combined' , { stream: winston.stream }));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//application layers
Init(app);
Routes(app);
// errorHandler(app);


module.exports = app;
