const { MessageEmbed } = require('discord.js');
const { entryRoleName, defaultChannelName, exitEmojiName } = require('../config.json');

const removeEmojis = function(str) {
    return str.replace(/([\uE000-\uF8FF]|\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDDFF])/g, '').trim();
}

const postExitMessage = async function(guild, guildMember, isPartial) {
    const defaultChannel = guild.channels.cache.find(channel => channel.name === defaultChannelName && channel.type === 'GUILD_TEXT');

    if (!defaultChannel) {
        throw SyntaxError(`Guild ${guild.name} does not have a text channel named ${defaultChannelName}.`)
    }

    const exitReactEmoji = await guild.emojis.cache.find(emoji => emoji.name === exitEmojiName);

    const exitMessageEmojis = [
        ":sob:", ":pleading_face:", ":pensive:", ":worried:", ":scream:", ":frowning:",
        ":anguished:", ":wave:", ":city_sunset:", ":airplane_departure:", ":rocket:", ":x:",
        ":no_entry_sign:", ":octagonal_sign:", ":no_entry:", ":sos:"
    ];
    const randomexitEmojiIndex = Math.floor(exitMessageEmojis.length * Math.random());
    const exitMessageEmoji = exitMessageEmojis[randomexitEmojiIndex];

    const exitMessages = [
        `**${exitMessageEmoji} ${guildMember.toString()} has left ${guild.name}. Let's all join in chairing them off.**`,
        `**${exitMessageEmoji} ${guildMember.toString()} has retired from ${guild.name}. Let's celebrate their long and successful career by chairing them off.**`,
    ];
    const randomExitMessageIndex = Math.floor(exitMessages.length * Math.random());
    const exitMessage = exitMessages[randomExitMessageIndex];

    const embed = new MessageEmbed()
        .setTitle(`Goodbye ${isPartial ? guildMember.name : guildMember.displayName}`)
        .setColor(0xe24540) // red
        .setDescription(exitMessage);

    await defaultChannel.send({ embeds: [embed] })
        .then(message => {
            if (exitReactEmoji) {
                message.react(exitReactEmoji);
            }
        });
}

module.exports = {
    name: 'guildMemberRemove',
    once: false,
    async execute(guildMember) {
        if (guildMember.partial) {
            // if partial, the member is already gone and fetching won't do anything (see also ./messageDelete.js)
            // instead, try and use whatever info is in the Partial data to send messages
            await postExitMessage(guildMember.guild, guildMember.user, guildMember.partial)
            .catch(err => console.error(err));
            return;
        }

        if (guildMember.roles.cache.some(role => removeEmojis(role.name) === entryRoleName)) {
            // If someone has been given the entry role
            await postExitMessage(guildMember.guild, guildMember, guildMember.partial)
                .catch(err => console.error(err));
        }
    }
}