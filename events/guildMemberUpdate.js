const { MessageEmbed } = require('discord.js');
const { entryRoleName, defaultChannelName, welcomeEmojiName } = require('../config.json');

module.exports = {
    name: 'guildMemberUpdate',
    once: false,
    async execute(oldMember, newMember) {
        return;
    }
}