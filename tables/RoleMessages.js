const { Sequelize, Model } = require('sequelize');

module.exports = class RoleMessages extends Model {
    static init(sequelize) {
        return super.init({
            messageId: {
                type: Sequelize.STRING,
                unique: true,
                primaryKey: true,
                allowNull: false
            },
            guildId: {
                type: Sequelize.STRING,
                allowNull: true
            },
            channelId: {
                type: Sequelize.STRING,
                allowNull: true
            },
            roleType: {
                type: Sequelize.STRING,
                allowNull: true
            },
        }, {
            tableName: 'RoleMessages',
            timestamps: true,
            sequelize: sequelize
        })
    }
}