const { entryChannelName, entryRoleName, defaultChannelName, welcomeEmojiName  } = require('../config.json')

const removeEmojis = function(str) {
    return str.replace(/([\uE000-\uF8FF]|\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDDFF])/g, '').trim();
}

const entryWordPattern = /[rR]\s?\/?\s?[aA]\s?[fF]\s?[lL]/g;

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
        if (message.channel.name !== entryChannelName) {
            return;
        }
        if (!message.content.match(entryWordPattern)) {
            return;
        }

        const messageGuildMember = await message.guild.members.fetch(message.author.id)
            .catch(err => {
                console.error(err);
                return;
            });
        const entryRole = await message.guild.roles.cache.find(role => removeEmojis(role.name) === entryRoleName);
        if (messageGuildMember.roles.cache.has(entryRole.id)) {
            /*  if the person messaging entry channel already has the role, they're probably a mod, and shouldn't
                trigger a welcome if they say the entry word (e.g. to explain) */
            return;
        }

        await messageGuildMember.roles.add(entryRole);
        await postEntryMessage(messageGuildMember)
            .catch(err => console.error(err));
    }
}