var express = require('express');
var passport = require('passport');
var Account = require('../models/account');
var PowerDNSDb = require('../models/database');
var router = express.Router();
var fs = require('fs');


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
        res.redirect('/domains');
});

router.post('/registerdomain', function(req, res) {
    var domain = req.body.domain;
    if(!req.user) {
        res.status(403).send('Access Denied');
        return;
    }
    if(domain.substr(domain.length - 2) === ".o") {
        PowerDNSDb.checkIfDomainExists(req.body.domain, function(valid, err)
        {
            if (!err) {
                if (valid) {
                    res.render('error', {error: new Error('The domain is already registered!'), redirect: "2; url=/domains"});
                } else {
                    PowerDNSDb.registerDomain(req.user, req.body.domain, req.body.nameserver);
                    res.redirect('/domains');
                }
            } else {
                res.render('error', {error: err, redirect: "2; url=/domains"});
            }
        });
        return;
    } else {
        res.render('error', {error: new Error('The domain should end in .o!'), redirect: "2; url=/domains"});
        return;
    }
});


router.post('/changenameservers', function(req, res) {
    if(!req.user) {
        res.status(403).send('Access Denied');
        return;
    }
    PowerDNSDb.updateNameServer(req.user, req.body.nameserver, req.body.domain);
    res.redirect('/domains');
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
        PowerDNSDb.getAllUserDomain(req.user, function (error, rows, fields) {
            res.render('domains', {rows: rows});
        });
    }
});


module.exports = router;
