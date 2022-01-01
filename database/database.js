const Sequelize = require('sequelize');
const { databaseName, userName, userPassword, hostName } = require('./databaseConfig.json');

module.exports = new Sequelize(databaseName, userName, userPassword, {
        host: hostName,
        dialect: 'mysql',
        logging: false
    });