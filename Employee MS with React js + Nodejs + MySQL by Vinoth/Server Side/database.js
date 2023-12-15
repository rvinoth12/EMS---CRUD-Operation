var mysql = require("mysql");

var connection = mysql.createConnection({
    host: 'localhost',
    database: 'employee',
    user: 'root',
    password: 'Shanu@901',
    multipleStatements: true
});

module.exports = connection;



