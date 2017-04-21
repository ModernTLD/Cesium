# cesium
A domain registry system, coded in Node.js

## Usage
1. Install nodejs, MySQL server, MongoDB.
2. Run `npm install`
3. Prepare the database
	* Install PowerDNS (or run `mysql -u [username] -p [password] -D [name of the database] < _schema_test.sql`)
	* Run `mysql -u [username] -p [password] -D [name of the database] < _schema_extra.sql`
4. Set up the config
5. Run `node app.js`
6. Voilà! 

## Configuration file
The example file is `config.json.example`.

### Web --web--
| key | value type | details |
| --- | --- | --- |
| port | integer | the port on which the Express server should run on |

### Database --database--
_(MySQL connection)_
| key | value type | details |
| --- | --- | --- |
| host | string | the host of the MySQL server |
| user | string | the username of the MySQL server |
| password | string | the password of the MySQL server |
| database | string | the name of the database |

## TODO
- Fix all issues
- Restructure the project
- Clean the mess

