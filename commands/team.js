const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageSelectMenu, MessageEmbed } = require('discord.js');
const teamEmojis = require('../data/teams.json');
const teamNames = Object.values(teamEmojis).map(emojiDetails => emojiDetails.roleName);
const { unauthorisedEmojiName, invalidEmojiName } = require('../config.json');

const removeEmojis = function(str) {
    return str.replace(/([\uE000-\uF8FF]|\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDDFF])/g, '').trim();
}

module.exports = {
    data: new SlashCommandBuilder()
            .setName('team')
            .setDescription('Manually manage team roles.')
            .addSubcommand(subcommand =>
                subcommand
                    .setName('add')
                    .setDescription('Add a team.')
            )
            .addSubcommand(subcommand =>
                subcommand
                    .setName('remove')
                    .setDescription('Remove a team.')
            ),
    async execute(interaction) {
        const invalidEmoji = interaction.guild.emojis.cache.find(emoji => emoji.name === invalidEmojiName);

        let row = new MessageActionRow();

        if (interaction.options._subcommand === 'remove') {
            row
                .addComponents(
                    new MessageSelectMenu()
                        .setCustomId('team-remove-selection')
                        .setPlaceholder('No team selected')
                        .addOptions([
                            {
                                label: 'All',
                                description: 'Remove all teams',
                                value: 'All'
                            }
                        ])
                );

            interaction.member.roles.cache.each(role => {
                const strippedRoleName = removeEmojis(role.name);

                if (teamNames.includes(strippedRoleName)) {
                    row.components[0]
                        .addOptions([
                            {
                                label: role.name,
                                value: strippedRoleName
                            }
                        ]);
                }
            });

            if (row.components[0].options.length === 1) {
                // If the only team we can find to remove is "Any", then there's nothing to do
                const embed = new MessageEmbed()
                    .setColor(0xe24540) // red
                    .setTitle(`${invalidEmoji} No teams available to remove.`)
                await interaction.reply({ embeds: [embed], ephemeral: true })
            }
            else {
                row.components[0]
                    .setMinValues(1)
                    .setMaxValues(row.components[0].options.length);
        
                await interaction.reply({ content: 'Select team(s) to remove:', components: [row], ephemeral: true });
            }
        }
        else if (interaction.options._subcommand === 'add') {
            row
            .addComponents(
                new MessageSelectMenu()
                .setCustomId('team-add-selection')
                .setPlaceholder('No team selected')
            );

            interaction.guild.roles.cache.each(role => {
                if (interaction.member.roles.cache.has(role.id)) {
                    return
                }

                const strippedRoleName = removeEmojis(role.name);

                if (teamNames.includes(strippedRoleName)) {
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
                    .setColor(0xe24540) // red
                    .setTitle(`${invalidEmoji} No teams available to add.`)
                await interaction.reply({ embeds: [embed], ephemeral: true })
            }
            else {
                row.components[0]
                .setMinValues(1)
                .setMaxValues(row.components[0].options.length);

                await interaction.reply({ content: 'Select team(s) to add:', components: [row], ephemeral: true })
            }
        }
    },
};