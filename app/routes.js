const isLoggerdIn = (req, res, next) => {
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect('/');
};

module.exports = function(app, passport) {
    app.get('/', async (req, res) => {
        res.render('index');
    });
    app.get('/login', async (req, res) => {
        res.render('login', {message: req.flash('loginMessage')});
    });
    app.get('/signup', async (req, res) => {
        res.render('signup', {message: req.flash('signupMessage')});
    });
    app.get('/profile', isLoggerdIn, async (req, res) => {
        res.render('profile', {
            user: req.user,
            type: req.query['type']
        });
    });
    app.get('/logout', async (req, res) => {
        req.logout();
        res.redirect('/');
    });
    app.get('/auth/facebook', passport.authenticate('facebook', {scope: ['email']}));
    app.get('/auth/facebook/callback',
        passport.authenticate('facebook', {
            successRedirect: '/profile?type=facebook',
            failureRedirect: '/'
        })
    );
    app.post('/login', passport.authenticate('local-login', {
        successRedirect: '/profile?type=local',
        failureRedirect: '/login',
        failureFlash: true
    }));
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect: '/profile',
        failureRedirect: '/signup',
        failureFlash: true
    }));
};