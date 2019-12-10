const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const flash = require('connect-flash');
const path = require('path');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('express-session');

const app = express();
const port = process.env.PORT || 6868;

const configDB = require('./config/database');

mongoose.connect(configDB.url, { useNewUrlParser: true, useUnifiedTopology: true })//ket noi toi db
    .then(() => console.log("MongoDB connected..."))
    .catch(err => console.log(err));

require('./config/passport')(passport);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(morgan('dev')); //log tat ca request ra console log
app.use(cookieParser('secret'));    //doc cookie (can cho xac thuc)
app.use(bodyParser.json());    //doc cookie (can cho xac thuc)
app.use(bodyParser.urlencoded({extended: true}));      //lasy thoong tin twf html forms
app.use(express.static(path.join(__dirname, 'public')));

//cac cai dat can thiet cho passport
app.use(session({secret: 'hoaiphanvannnnnnnn'})); //chuoi bi mat ma hoa cookie
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

require('./app/routes')(app, passport);

app.listen(port, () => {
    console.log('Server is running on port: ', port);
});