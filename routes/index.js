var express = require('express');
var passport = require('passport');
var Account = require('../models/account');
var router = express.Router();
var fs = require('fs');
var mysql = require('mysql');
const dateTime = Date.now();
const timestamp = Math.floor(dateTime / 1000);
var domainToUsername = mysql.createConnection({
    host     : 'localhost',
    user     : 'theob',
    password : 'RQuQciIv8Qw4kmP2',
    database : 'pdns'
});
domainToUsername.connect();


router.get('/', function (req, res) {
    res.render('index', { user : req.user });
});

router.get('/register', function(req, res) {
    res.render('register', { });
});

router.post('/register', function(req, res) {
    Account.register(new Account({ username : req.body.username }), req.body.password, function(err, account) {
        if (err) {
            return res.render('register', { account : account });
        }

        passport.authenticate('local')(req, res, function () {
            res.redirect('/');
        });
    });
});

router.get('/login', function(req, res) {
    res.render('login', { user : req.user });
});

router.post('/login', passport.authenticate('local', { failureRedirect: '/no', failureFlash: false }), function(req, res) {
        res.redirect('/');
});

router.post('/registerdomain', function(req, res) {
    var domain = req.body.domain;
    if(!req.user) {
        res.status(403).send('Access Denied');
        return;
    }
    if(domain.substr(domain.length - 2) === ".o") {
        domainToUsername.query('SELECT * FROM `records` WHERE `name` = \'' + req.body.domain + '\'' ,function (error, result, fields) {
            if (result.length > 0) {
                res.send('<head><meta http-equiv="refresh" content="2; url=/domains" /></head><body><p>This domain is already registered. Redirecting you back to the domain page.</p></body>');
            } else {
                domainToUsername.query('INSERT INTO `user_to_domain` (`user`, `domain`, `nameserver`) VALUES (\'' + req.user.username + '\', \'' + req.body.domain + '\', \'' + req.body.nameserver + '\');',  function (error, results, fields) {if (error) throw error;});
                domainToUsername.query('INSERT INTO `records` (`id`, `domain_id`, `name`, `type`, `content`, `ttl`, `prio`, `change_date`, `disabled`, `ordername`, `auth`) VALUES (NULL, \'17\', \'' + req.body.domain +  '\', \'NS\', \'' + req.body.nameserver + '\', \'86400\', \'0\', \'' + timestamp.toString() + '\', \'0\', NULL, \'1\');', function (error, results, fields) {if (error) throw error;});
                res.send('<head><meta http-equiv="refresh" content="2; url=/domains" /></head><body><p>Domain Successfully Registered! Redirecting you back to the domain page.</p></body>');
            }
        });
        return;
    } else {
        res.send('<head><meta http-equiv="refresh" content="2; url=/domains" /></head><body><p>Please make sure that your domain ends in .o! Redirecting you back to the domain page.</p></body>');
        return;
    }



});


router.post('/changenameservers', function(req, res) {
    if(!req.user) {
        res.status(403).send('Access Denied');
        return;
    }
    domainToUsername.query('SELECT `domain` FROM `user_to_domain` WHERE `user` = \'' + req.user.username + '\'', function (error, rows, fields) {
    var changed = false;
    for(row in rows) {
        if(row.domain === req.body.domain) {
            domainToUsername.query('UPDATE `user_to_domain` SET `nameserver`= "' + req.body.nameserver + '" WHERE `domain` = "' + req.body.domain +'";',  function (error, results, fields) {if (error) throw error;});
            domainToUsername.query('UPDATE `records` SET `content` = \'' + req.body.nameserver + '\' WHERE `records`.`name` = \'' + req.body.domain + '\'',  function (error, results, fields) {if (error) throw error;});
            changed = true;
            break;
        } else {
            changed = false;
        }
    }
    if(changed) {
        res.send('<head><meta http-equiv="refresh" content="2; url=/domains" /></head><body><p>Domain nameservers set successfully! Redirecting you back to the domains page!</p></body>');
    } else {
        res.send('<head><meta http-equiv="refresh" content="2; url=/domains" /></head><body><p>We couldn\'t set your nameservers due to an unknown error! Redirecting you back to the domains page!</p></body>');
    }
    });
    });






router.get('/no', function(req, res) {
    res.render('no')
});

router.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});

router.get('/domains', function(req, res) {
    if (!req.user) {
        res.redirect('/no')
    } else {
        domainToUsername.query('SELECT `domain`, `nameserver` FROM `user_to_domain` WHERE `user` = \'' + req.user.username + '\'', function (error, rows, fields) {
            res.render('domains', {rows: rows});
        });
    }
});


module.exports = router;
