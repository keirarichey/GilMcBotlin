const { MessageEmbed } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const teamEmojis = require('../data/teams.json');
const RoleMessages = require('../tables/RoleMessages.js')

const removeEmojis = function(str) {
    return str.replace(/([\uE000-\uF8FF]|\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDDFF])/g, '').trim();
}

module.exports = {
    data: new SlashCommandBuilder()
            .setName('createteamrolemessage')
            .setDescription('Generate a message and reactions for assigning team roles.')
            .setDefaultPermission(false),
            
    async execute(interaction) {
        let embed = new MessageEmbed()
            .setColor(0x0f73bf) // approx. "AFL blue"
            .setTitle('AFL Roles')
            .setDescription(`To receive an AFL team role, react to this message with your choice of team. Note that if you choose multiple teams, your role colour will be the highest team in the ordering.\n`);

        Object.entries(teamEmojis).forEach(([roleEmojiName, emojiInfo]) => {
            const roleEmoji = interaction.guild.emojis.cache.find(emoji => emoji.name === roleEmojiName);
            const roleName = emojiInfo.roleName; 

            if (interaction.guild.roles.cache.some(role => removeEmojis(role.name) === roleName)) {
                const guildRole = interaction.guild.roles.cache.find(role => removeEmojis(role.name) === roleName);
                embed.setDescription(embed.description.concat(`${roleEmoji} ${guildRole.toString()}\n`));
                // embed.addField(`\u200b`, `${roleEmoji} ${guildRole.toString()}`, true);
            }
        });

        await interaction.channel.send({ embeds: [embed] })
            .then(async message => {
                Object.entries(teamEmojis).forEach(async ([emojiName, emojiInfo]) => {
                    if (!interaction.guild.roles.cache.some(role => removeEmojis(role.name) === emojiInfo.roleName)) {
                        return;
                    };

                    const roleEmoji = await interaction.guild.emojis.cache.find(emoji => emoji.name === emojiName);
                    await message.react(roleEmoji);
                });

                await RoleMessages.create({
                    messageId: message.id,
                    guildId: message.guildId,
                    channelId: message.channelId,
                    roleType: 'team'
                });
            })
            .then(interaction.reply({ content: 'Role comment generated.', ephemeral:true }));
    }
}