const { entryChannelName, entryRoleName } = require('../config.json')

const removeEmojis = function(str) {
    return str.replace(/([\uE000-\uF8FF]|\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDDFF])/g, '').trim();
}

module.exports = {
    name: 'messageCreate',
    once: false,
    async execute(message) {
        if (message.partial) {
            await message.fetch()
                .catch(err => {
                    console.error(err);
                    return;
                });
        }

        if (message.author.bot) {
            return;
        }
        if (!message.guild) {
            return;
        }
        if (message.channel.name === entryChannelName) {
            const messageGuildMember = await message.guild.members.fetch(message.author.id)
                .catch(err => {
                    console.error(err);
                    return;
                });
            const entryRole = await message.guild.roles.cache.find(role => removeEmojis(role.name) === entryRoleName);
            if (!messageGuildMember.roles.cache.has(entryRole.id)) {
                await messageGuildMember.roles.add(entryRole);
            }
        }
    }
}