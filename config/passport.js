const LocalStrategy = require('passport-local').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;

const configAuth = require('./auth');
const User = require('../app/models/user');

module.exports = (passport) => {
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser((id, done) => {
        User.findById(id, (err, user) => {
            done(err, user);
        });
    });

    passport.use('local-signup', new LocalStrategy({
        //mac dinh local strategy sd username va password
        //chng ta can cau hinh lai
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true // cho phep chung ta gui lai ham callback
        },
        (req, email, password, done) => {
            process.nextTick(()=>{
                User.findOne({'local.email': email}, (err, user) => {
                    if(err)
                        return done(err);
                    if(user) {
                        return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
                    } else {
                        let newUser = new User();
                        newUser.local.email = email;
                        newUser.local.password = newUser.generateHash(password);

                        newUser.save((err) => {
                            if(err)
                                throw err;
                            return done(null, newUser);
                        })
                    }
                });
            });
        }
    ));

    passport.use('local-login', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    },
        (req, email, password, done) => {
            User.findOne({'local.email': email}, (err, user) => {
                if(err)
                    return done(err);
                if(!user)
                    return done(null, false, req.flash('loginMessage', 'Incorrect username.'));
                if(!user.validPassword(password))
                    return done(null, false, req.flash('loginMessage', 'Incorrect password.'));
                return done(null, user);
            });
        }
    ));

    let info = ['id', 'about', 'address', 'birthday', 'email', 'education', 'first_name', 'gender',
                'link', 'middle_name', 'name', 'profile_pic', 'quotes'];

    passport.use(new FacebookStrategy({
        clientID: configAuth.facebookAuth.clientID,
        clientSecret: configAuth.facebookAuth.clientSecret,
        callbackURL: configAuth.facebookAuth.callbackURL,
        profileFields: ['birthday', 'id', 'displayName', 'email', 'first_name', 'last_name',
            'middle_name', 'photos', 'gender', 'profileUrl']
    },
        (token, refreshToken, profile, done) => {
            process.nextTick(() => {
                User.findOne({'facebook.id': profile.id}, (err, user) => {
                    if(err)
                        return done(err);
                    if(user){
                        return done(null, user);
                    } else {
                        let newUser = new User();
                        newUser.facebook.id = profile.id;
                        newUser.facebook.token = profile.token;
                        newUser.facebook.name = profile.name.givenName + ' ' + profile.name.familyName;
                        newUser.facebook.email = profile.emails[0].value;
                        newUser.save((err) => {
                            if(err)
                                throw err;
                            return done(null, newUser);
                        });
                    }
                });
            });
        }
    ));
};