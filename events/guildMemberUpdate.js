const { MessageEmbed } = require('discord.js');
const { entryRoleName, defaultChannelName, welcomeEmojiName } = require('../config.json');

const removeEmojis = function(str) {
    return str.replace(/([\uE000-\uF8FF]|\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDDFF])/g, '').trim();
}

const postEntryMessage = async function(guildMember) {
    const guild = guildMember.guild;
    const defaultChannel = guild.channels.cache.find(channel => channel.name === defaultChannelName && channel.type === 'GUILD_TEXT');

    if (!defaultChannel) {
        throw SyntaxError(`Guild ${guild.name} does not have a text channel named ${defaultChannelName}.`)
    }

    let welcomeEmoji = guild.emojis.cache.find(emoji => emoji.name === welcomeEmojiName);

    if (!welcomeEmoji) {
        const defaultWelcomeEmojis = [
            ':raised_hands:', ':clap:', ':wave:', ':call_me:', ':partying_face:',
            ':star_struck:', ':handshake:', ':thumbsup:', ':confetti_ball:',
            ':tada:', ':sparkles:', ':star2:', ':fireworks:'
        ];
        const randomWelcomeEmojiIndex = Math.floor(defaultWelcomeEmojis.length * Math.random());
        welcomeEmoji = defaultWelcomeEmojis[randomWelcomeEmojiIndex];
    }

    const welcomeMessages = [
        `**${welcomeEmoji} Welcome to ${guild.name}, ${guildMember.toString()}!**`,
        `**${welcomeEmoji} Hello ${guildMember.toString()} and welcome to ${guild.name}!**`,
        `**${welcomeEmoji} Hi ${guildMember.toString()}! Welcome to ${guild.name}.**`,
        `**${welcomeEmoji} ${guildMember.toString()} has joined ${guild.name}. Welcome!**`,
    ];
    const randomWelcomeMessageIndex = Math.floor(welcomeMessages.length * Math.random());
    const welcomeMessage = welcomeMessages[randomWelcomeMessageIndex];

    const embed = new MessageEmbed()
        .setColor(0x33b23b) // green
        .setDescription(welcomeMessage);

    await defaultChannel.send({ embeds: [embed] });
}

module.exports = {
    name: 'guildMemberUpdate',
    once: false,
    async execute(oldMember, newMember) {
        if (oldMember.partial) {
            try {
                console.log(oldMember)
                console.log("fetching oldMember: ", oldMember.displayName)
                await oldMember.fetch();
                await oldMember.guild.members.fetch({user: oldMember, force: true});
                ;
            }
            catch (err) {
                console.error(err);
                return;
            }
        }
        if (newMember.partial) {
            try {
                console.log("fetching newMember: ", oldMember.displayName)
                await newMember.fetch();
                await newMember.guild.members.fetch({user: newMember, force: true});
            }
            catch (err) {
                console.error(err);
                return;
            }
        }
        
        if (newMember.roles.cache.some(role => removeEmojis(role.name) === entryRoleName) && !oldMember.roles.cache.some(role => removeEmojis(role.name) === entryRoleName)) {
            // If someone has been given the entry role
            console.log(oldMember.displayName);
            console.log("old")
            oldMember.roles.cache.forEach(role => console.log(role.name));
            console.log("new")
            newMember.roles.cache.forEach(role => console.log(role.name));
            await postEntryMessage(newMember)
                .catch(err => console.error(err));
        }
    }
}