const { MessageEmbed } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const pronounEmojis = require('../data/pronouns.json');
const RoleMessages = require('../tables/RoleMessages.js')

const removeEmojis = function(str) {
    return str.replace(/([\uE000-\uF8FF]|\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDDFF])/g, ':').trim();
}

module.exports = {
    data: new SlashCommandBuilder()
            .setName('createpronounrolemessage')
            .setDescription('Generate a message and reactions for assigning pronoun roles.')
            .setDefaultPermission(false),
            
    async execute(interaction) {
        let embed = new MessageEmbed()
            .setColor(0x0ec262) // green-ish
            .setTitle('Pronoun Roles')
            .setDescription(`To receive a pronoun role, react with the following emojis:\n`);

        Object.entries(pronounEmojis).forEach(([roleEmojiName, emojiInfo]) => {
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
                Object.entries(pronounEmojis).forEach(async ([emojiName, emojiInfo]) => {
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
                    roleType: 'pronoun'
                });
            })
            .then(interaction.reply({ content: 'Role comment generated.', ephemeral:true }));
    }
}