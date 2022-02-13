const RoleMessages = require(`../tables/RoleMessages.js`);

const teamEmojis = require('../data/teams.json');
const gameEmojis = require('../data/games.json');
const pronounEmojis = require('../data/pronouns.json');
const bblEmojis = require('../data/bbl.json');

const removeEmojis = function(str) {
    return str.replace(/([\uE000-\uF8FF]|\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDDFF])/g, '').trim();
}

const addRoleFromEmojiMap = async function(reaction, member, emojiMap) {
    /* Syntax of emojiMap:
        emojiMap = {
            "emojiName": { roleName: "roleName", emoji: "✅" },
            etc., where emojiName is unicode, otherwise it is left out
        }
    */
    if (member.partial) {
        await member.fetch()
            .catch(err => {
                console.error(err);
                return;
            });
    }
    
    const emojiKeys = Object.keys(emojiMap);
    const roleEmojiKey = emojiKeys.find(key => emojiMap[key].emoji === reaction.emoji.name || key === reaction.emoji.name);
    const roleName = emojiMap[roleEmojiKey].roleName;

    const guildRole = reaction.message.guild.roles.cache.find(role => {
        const strippedRoleName = removeEmojis(role.name);

        return roleName === strippedRoleName;
    });

    console.log(member);
    if (!member.roles.cache.has(guildRole.id)) {
        // Add this role if the member does not have it already.
        member.roles.add(guildRole)
            .catch(error => console.error(error));
    }
}

module.exports = {
    name: 'messageReactionAdd',
    once: false,
    async execute(messageReaction, user) {
        if (user.bot) {
            return;
        }

        if (messageReaction.partial) {
            await messageReaction.fetch()
                .catch(err => {
                    console.error(err);
                    return;
                });
        }

        const reactionGuildMember = await messageReaction.message.guild.members.fetch(member => member.id === user.id)
            .then(member => {console.log(member)})
            .catch(err => {
                console.error(err);
                return;
            });

        const roleMessage = await RoleMessages.findOne({
            where: {
                messageId: messageReaction.message.id,
                guildId: messageReaction.message.guildId,
                channelId:messageReaction.message.channelId
            }
        });

        if (roleMessage) {
            switch (roleMessage.dataValues.roleType) {
                case 'team':
                    await addRoleFromEmojiMap(messageReaction, reactionGuildMember, teamEmojis);
                    break;

                case 'game':
                    await addRoleFromEmojiMap(messageReaction, reactionGuildMember, gameEmojis);
                    break;

                case 'bbl':
                    await addRoleFromEmojiMap(messageReaction, reactionGuildMember, bblEmojis);
                    break;

                case 'pronoun':
                    await addRoleFromEmojiMap(messageReaction, reactionGuildMember, pronounEmojis);
                    break;
            }
        }
    }
}