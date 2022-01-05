const { MessageEmbed } = require('discord.js');
const { deletedMessageChannelName } = require('../config.json')

const removeEmojis = function(str) {
    return str.replace(/([\uE000-\uF8FF]|\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDDFF])/g, '').trim();
}

module.exports = {
    name: 'messageDelete',
    once: false,
    async execute(message) {
        if (message.partial) {
            try {
                await message.fetch();
            } catch {
                console.log("Partial Message deleted, no data can be retrieved");
                return;
            }
        }
        if (message.author.bot) {
            return;
        }
        if (!message.guild) {
            return;
        }
        if (message.channel.name === deletedMessageChannelName) {
            return;
        }

        const messageGuildMember = await message.guild.members.cache.find(member => member.id === message.author.id);
        await messageGuildMember.fetch()
            .catch(err => {
                console.error(err);
                return;
            });

        const embed = new MessageEmbed()
            .setThumbnail(message.author.avatarURL())
            .setTitle(`${messageGuildMember.displayName}`)
            .setColor(0x345b95) // standard blue
            .setDescription(`**Message by ${messageGuildMember.toString()} in ${message.channel.toString()}:**\n${message.content}`)
            .setTimestamp();

        await message.guild.channels.cache.find(channel => channel.name === deletedMessageChannelName)?.send({ embeds: [embed] })
            .catch(err => console.error(err));
        
    }
}