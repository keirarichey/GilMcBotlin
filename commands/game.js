const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageSelectMenu, MessageEmbed } = require('discord.js');
const gameEmojis = require('../data/games.json');
const gameNames = Object.values(gameEmojis).map(emojiDetails => emojiDetails.roleName);

const removeEmojis = function(str) {
    return str.replace(/([\uE000-\uF8FF]|\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDDFF])/g, '').trim();
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('game')
        .setDescription('Manually manage game roles.')
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('Add a game.')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('Remove a game.')
        ),
    async execute(interaction) {
        let row = new MessageActionRow()

        if (interaction.options._subcommand === 'remove') {
            row
                .addComponents(
                    new MessageSelectMenu()
                        .setCustomId('game-remove-selection')
                        .setPlaceholder('No game selected')
                        .addOptions([
                        {
                            label: 'All',
                            description: 'Remove all games',
                            value: 'All'
                        }
                    ])
                );

            interaction.member.roles.cache.each(role => {
                const strippedRoleName = removeEmojis(role.name)
                if (gameNames.includes(strippedRoleName)) {
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
    
            await interaction.reply({ content: 'Select game(s) to remove:', components: [row], ephemeral: true });
        }
        else if (interaction.options._subcommand === 'add') {
            row
                .addComponents(
                    new MessageSelectMenu()
                        .setCustomId('game-add-selection')
                        .setPlaceholder('No game selected')
                );

            interaction.guild.roles.cache.each(role => {
                if (interaction.member.roles.cache.has(role.id)) {
                    return
                }
                const strippedRoleName = removeEmojis(role.name)
                if (gameNames.includes(strippedRoleName)) {
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
                    .setDescription('No games available to add.')
                await interaction.reply({ embeds: [embed], ephemeral: true })
            }
            else {
                row.components[0]
                    .setMinValues(1)
                    .setMaxValues(row.components[0].options.length);

                await interaction.reply({ content: 'Select game(s) to add:', components: [row], ephemeral: true })
            }
        }
    },
};