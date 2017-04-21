// This is in replacement of @theospace code

var databaseConfig = require('../config.json').database;
var mysql = require('mysql');
var databaseConn = mysql.createConnection(databaseConfig);

var database = {};

database.checkIfDomainValid = function(domainName) {
	return /(?=^.{4,253}$)(^((?!-)[a-zA-Z0-9-]{0,62}[a-zA-Z0-9]\.)+[a-zA-Z]{1,63}$)/.test(domainName)
}

database.checkIfDomainExists = function(domainName, callback) {
	if (database.checkIfDomainValid(domainName)) {
		var query = 'SELECT * FROM `records` WHERE `name` = ?';
		databaseConn.query(query, [domainName], function (error, result, fields) {
			if (result.length > 0)
				callback(true, null);
			else
				callback(false, null);
		});
	} else {
		callback(false, new Error('The given domain name is not valid.'));
	}
};

database.registerDomain = function(user, domainName, nameserver) {
	if (!database.checkIfDomainValid(domainName))
		throw new Error('The given domain name is not valid.');

	var dateTime = Date.now();
	var timestamp = Math.floor(dateTime / 1000);

	databaseConn.query('INSERT INTO `user_to_domain` (`user`, `domain`, `nameserver`) VALUES (?, ?, ?);', [user.username, domainName, nameserver], function (error, results, fields) {if (error) throw error;});
	databaseConn.query('INSERT INTO `records` (`id`, `domain_id`, `name`, `type`, `content`, `ttl`, `prio`, `change_date`, `disabled`, `ordername`, `auth`) VALUES (NULL, \'17\', ?, \'NS\', ?, \'86400\', \'0\', ?, \'0\', NULL, \'1\');',
		[domainName, nameserver, timestamp], function (error, results, fields) {if (error) throw error;});
};

database.getAllUserDomain = function(user, callback) {
	databaseConn.query('SELECT `domain`, `nameserver` FROM `user_to_domain` WHERE `user` = ?', [user.username], function (error, rows, fields) {
		callback(error, rows, fields);
	});
};

database.updateNameServer = function(user, nameserver, domain) {
	databaseConn.query('SELECT * FROM `user_to_domain` WHERE `user` = ? AND `domain` = ?', [user.username, domain], function(err, res, fields) {
		if (res.length > 0){
			databaseConn.query('UPDATE `user_to_domain` SET `nameserver`= ? WHERE `domain` = ?;', [nameserver, domain], function (error, results, fields) {if (error) throw error;});
    		databaseConn.query('UPDATE `records` SET `content` = ? WHERE `records`.`name` = ?', [nameserver, domain], function (error, results, fields) {if (error) throw error;});
		}
	});
};

module.exports = database;