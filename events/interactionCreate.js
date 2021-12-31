
const { MessageEmbed } = require('discord.js');
const { unauthorisedEmojiName, invalidEmojiName } = require('../config.json');

const teamEmojis = require('../data/teams.json');
const teamNames = Object.values(teamEmojis).map(emojiDetails => emojiDetails.roleName);

const bblEmojis = require('../data/bbl.json');
const bblNames = Object.values(bblEmojis).map(emojiDetails => emojiDetails.roleName);

const gameEmojis = require('../data/games.json');
const gameNames = Object.values(gameEmojis).map(emojiDetails => emojiDetails.roleName);

const pronounEmojis = require('../data/pronouns.json');
const pronounNames = Object.values(pronounEmojis).map(emojiDetails => emojiDetails.roleName);

const removeEmojis = function(str) {
    return str.replace(/([\uE000-\uF8FF]|\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDDFF])/g, '').trim();
}

const generateRoleEmbed = function(guild, alteredRoles, action, roleEmojis = null) {
    let embed = new MessageEmbed()
        .setColor(0x33b23b)
        .setTitle('✅ Roles updated');
    
    if (action === 'add') {
        embed.setDescription('Added roles:\n');
    }
    else if (action === 'remove') {
        embed.setDescription('Removed roles:\n');
    }
    else {
        throw new SyntaxError(`Invalid role alter action passed: ${action}.`);
    }

    if (roleEmojis) {
        alteredRoles.forEach(guildRole => {
            const strippedRoleName = removeEmojis(guildRole.name);
            const roleEmojiName = Object.keys(roleEmojis).find(key => roleEmojis[key].roleName === strippedRoleName);
            const emoji = guild.emojis.cache.find(emoji => emoji.name === roleEmojiName);

            embed.setDescription(embed.description.concat(`${emoji} ${guildRole.toString()}\n`));
        });
    }
    else {
        alteredRoles.forEach(guildRole => {
            embed.setDescription(embed.description.concat(`${guildRole.toString()}\n`));
        });
    }
    return embed;
}

const alterRoles = async function(interaction, action, roleNames, roleEmojis=null) {
    let alteredRoles = [];

    switch (action) {
        case 'add':
            if (interaction.values.includes('All')) {
                interaction.guild.roles.cache.each(guildRole => {
                    const strippedRoleName = removeEmojis(guildRole.name);

                    if (roleNames.includes(strippedRoleName)) {
                        if (!interaction.member.roles.cache.has(guildRole.id)) {
                            // Add this role if the member does not have it already.
                            interaction.member.roles.add(guildRole)
                                .then(alteredRoles.push(guildRole))
                                .catch(error => console.error(error));
                        }
                    }
                });
            }
            else {
                interaction.values.forEach(value => {
                    const guildRole = interaction.guild.roles.cache.find(role => {
                        const strippedRoleName = removeEmojis(role.name);

                        return value === strippedRoleName;
                    });
                    if (!interaction.member.roles.cache.has(guildRole.id)) {
                        // Add this role if the member does not have it already.
                        interaction.member.roles.add(guildRole)
                            .then(alteredRoles.push(guildRole))
                            .catch(error => console.error(error));
                    }
                });
            }
            break;
        
        case 'remove':
            if (interaction.values.includes('All')) {
                interaction.guild.roles.cache.each(guildRole => {
                    const strippedRoleName = removeEmojis(guildRole.name);

                    if (roleNames.includes(strippedRoleName)) {
                        if (interaction.member.roles.cache.has(guildRole.id)) {
                            // Remove this role if the member has it.
                            interaction.member.roles.remove(guildRole)
                                .then(alteredRoles.push(guildRole))
                                .catch(error => console.error(error));
                        }
                    }
                });
            }
            else {
                interaction.values.forEach(value => {
                    const guildRole = interaction.guild.roles.cache.find(role => {
                        const strippedRoleName = removeEmojis(role.name);

                        return value === strippedRoleName;
                    });
                    if (interaction.member.roles.cache.has(guildRole.id)) {
                        // Remove this role if the member has it.
                        interaction.member.roles.remove(guildRole)
                            .then(alteredRoles.push(guildRole))
                            .catch(error => console.error(error));
                    }
                });
            }
            break;
        
        default:
            throw new SyntaxError(`Invalid role alter action passed: ${action}.`);
    }

    await interaction.deferUpdate();

    const embed = generateRoleEmbed(interaction.guild, alteredRoles, action, roleEmojis);

    await interaction.editReply({ content:null, embeds: [embed], components: [] });
}

module.exports = {
    name: 'interactionCreate',
    once: false,
    async execute(interaction) {
        const invalidEmoji = interaction.guild.emojis.cache.find(emoji => emoji.name === invalidEmojiName);

        if (interaction.isCommand()) {
            const command = interaction.client.commands.get(interaction.commandName);
    
            if (!command) return;
    
            try {
                await command.execute(interaction);
            } catch (error) {
                console.error(error);

                const errorEmbed = new MessageEmbed()
                    .setColor(0xe24540) // red
                    .setTitle('There was an error with this command')
                    .setDescription(`${invalidEmoji} Either try again, or if it\'s just broken blame ${client.application.owner.toString()}.`);

                await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }
        }

        if (interaction.isSelectMenu()) {
            switch(interaction.customId) {
                /* TEAM ADD/REMOVE DROPDOWNS */
                case 'team-add-selection':
                    await alterRoles(interaction, action='add', roleNames=teamNames, roleEmojis=teamEmojis)
                        .catch(error => console.error(error));
                    break;
                case 'team-remove-selection':
                    await alterRoles(interaction, action='remove', roleNames=teamNames, roleEmojis=teamEmojis)
                        .catch(error => console.error(error));
                    break;

                /* GAME ADD/REMOVE DROPDOWNS */
                case 'game-add-selection':
                    await alterRoles(interaction, action='add', roleNames=gameNames)
                        .catch(error => console.error(error));
                    break;
                case 'game-remove-selection':
                    await alterRoles(interaction, action='remove', roleNames=gameNames)
                        .catch(error => console.error(error));
                    break;

                /* BBL ADD/REMOVE DROPDOWNS */
                case 'bbl-add-selection':
                    await alterRoles(interaction, action='add', roleNames=bblNames)
                        .catch(error => console.error(error));
                    break;
                case 'bbl-remove-selection':
                    await alterRoles(interaction, action='remove', roleNames=bblNames)
                        .catch(error => console.error(error));
                    break;

                /* PRONOUNS ADD/REMOVE DROPDOWNS */
                case 'pronoun-add-selection':
                    await alterRoles(interaction, action='add', roleNames=pronounNames)
                        .catch(error => console.error(error));
                    break;
                case 'pronoun-remove-selection':
                    await alterRoles(interaction, action='remove', roleNames=pronounNames)
                        .catch(error => console.error(error));
                    break;
            }
        }
    }
}