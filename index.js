const express = require('express');
const dotenv = require('dotenv');
const app = express();
const passport = require('passport');
const VkontakteStrategy = require('passport-vkontakte').Strategy;

dotenv.config();

app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({extended: true}));
app.use(require('express-session')({
    secret: process.env.APP_SECRET || 'secret',
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new VkontakteStrategy({
        clientID: process.env.VK_APP_ID,
        clientSectet: process.env.VK_APP_SECRET,
        callbackURL: process.env.VK_APP_CALLBACK_URL
    },
    function myVerifyCallbackFn(accessToken, refreshToken, params, profile, done) {
        console.log(profile);
        //TODO Поиск по profile.id в базе данных
        //done(null, null);
    }
));

passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    // User.findById(id)
    //     .then(user => done(null, user))
    //     .catch(done);
});

app.get('/auth/vkontakte',
    passport.authenticate('vkontakte'),
    function (req, res) {
        res.json({ok: true});
        // The request will be redirected to vk.com for authentication, so
        // this function will not be called.
    });

app.get('/auth/vkontakte/callback',
    passport.authenticate('vkontakte', {failureRedirect: '/login'}),
    function (req, res) {
        // Successful authentication, redirect home.
        res.redirect('/');
    });

app.use(function (req, res, next) {
    const err = new Error('Ни хрена не найдено!');
    err.status = 404;
    next(err);
});

app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.json({
        message: err.message,
        error: err
    })
})

const server = app.listen(process.env.PORT, function () {
    console.log('Сервер пашет на порту: ' + server.address().port);
})