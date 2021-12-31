const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageSelectMenu, MessageEmbed } = require('discord.js');
const pronounEmojis = require('../data/pronouns.json');
const pronounNames = Object.values(pronounEmojis).map(emojiDetails => emojiDetails.roleName);

const removeEmojis = function(str) {
    return str.replace(/([\uE000-\uF8FF]|\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDDFF])/g, '').trim();
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pronoun')
        .setDescription('Manually manage pronoun roles.')
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('Add a set of pronouns.')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('Remove a set of pronouns.')
        ),
    async execute(interaction) {
        let row = new MessageActionRow()

        if (interaction.options._subcommand === 'remove') {
            row
                .addComponents(
                    new MessageSelectMenu()
                        .setCustomId('pronoun-remove-selection')
                        .setPlaceholder('No pronouns selected')
                        .addOptions([
                        {
                            label: 'All',
                            description: 'Remove all pronouns',
                            value: 'All'
                        }
                    ])
                );

            interaction.member.roles.cache.each(role => {
                const strippedRoleName = removeEmojis(role.name)
                if (pronounNames.includes(strippedRoleName)) {
                    row.components[0]
                        .addOptions([
                            {
                                label: role.name,
                                value: strippedRoleName
                            }
                        ]);
                }
            });

            row.components[0]
                .setMinValues(1)
                .setMaxValues(row.components[0].options.length);
    
            await interaction.reply({ content: 'Select pronouns to remove:', components: [row], ephemeral: true });
        }
        else if (interaction.options._subcommand === 'add') {
            row
                .addComponents(
                    new MessageSelectMenu()
                        .setCustomId('pronoun-add-selection')
                        .setPlaceholder('No pronouns selected')
                );

            interaction.guild.roles.cache.each(role => {
                if (interaction.member.roles.cache.has(role.id)) {
                    return
                }
                const strippedRoleName = removeEmojis(role.name)
                if (pronounNames.includes(strippedRoleName)) {
                    row.components[0]
                        .addOptions([
                            {
                                label: role.name,
                                value: strippedRoleName
                            }
                        ]);
                }
            });

            if (row.components[0].options.length === 0) {
                const embed = new MessageEmbed()
                    .setColor(0xe24540)
                    .setDescription('No pronouns available to add.')
                await interaction.reply({ embeds: [embed], ephemeral: true })
            }
            else {
                row.components[0]
                    .setMinValues(1)
                    .setMaxValues(row.components[0].options.length);

                await interaction.reply({ content: 'Select pronouns to add:', components: [row], ephemeral: true })
            }
        }
    },
};