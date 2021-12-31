const { MessageEmbed } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const bblEmojis = require('../data/bbl.json');
const RoleMessages = require('../tables/RoleMessages.js')

const removeEmojis = function(str) {
    return str.replace(/([\uE000-\uF8FF]|\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDDFF])/g, ':').trim();
}

module.exports = {
    data: new SlashCommandBuilder()
            .setName('createbblrolemessage')
            .setDescription('Generate a message and reactions for assigning BBL team roles.')
            .setDefaultPermission(false),
            
    async execute(interaction) {
        let embed = new MessageEmbed()
            .setColor(0xd5ff19) // approx. "BBL green"
            .setTitle('BBL Roles')
            .setDescription(`To receive a BBL team role, react with the following emojis:\n*(Note: during the BBL season, these roles will appear before AFL roles)*\n`);

        Object.entries(bblEmojis).forEach(([roleEmojiName, emojiInfo]) => {
            const roleEmoji = emojiInfo.emoji;
            const roleName = emojiInfo.roleName; 

            if (interaction.guild.roles.cache.some(role => removeEmojis(role.name) === roleName)) {
                const guildRole = interaction.guild.roles.cache.find(role => removeEmojis(role.name) === roleName);
                embed.setDescription(embed.description.concat(`${roleEmoji} ${guildRole.toString()}\n`));
                // embed.addField(`\u200b`, `${roleEmoji} ${guildRole.toString()}`, true);
            }
        });

        await interaction.channel.send({ embeds: [embed] })
            .then(async message => {
                Object.entries(bblEmojis).forEach(async ([emojiName, emojiInfo]) => {
                    if (!interaction.guild.roles.cache.some(role => removeEmojis(role.name) === emojiInfo.roleName)) {
                        return;
                    };

                    const roleEmoji = emojiInfo.emoji;
                    await message.react(roleEmoji);
                });

                await RoleMessages.create({
                    messageId: message.id,
                    guildId: message.guildId,
                    channelId: message.channelId,
                    roleType: 'bbl'
                });
            })
            .then(interaction.reply({ content: 'Role comment generated.', ephemeral:true }));
    }
}