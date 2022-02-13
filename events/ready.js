const fs = require('fs');
const { DiscordAPIError } = require('discord.js');
const { guildId, ownerId } = require('../config');
const database = require('../database/database.js');
const RoleMessages = require('../tables/RoleMessages.js');

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        // Set bot's activity on a 30-minute loop: this is to prevent it just disappearing
        setInterval(() => {
            client.user.setPresence({ activities: [{ type: 'PLAYING', name: `with ${new Date().getFullYear() + 1} AFL rules` }], status: 'online' });
        }, 1800000);

        // Load all commands
        console.log();
        console.log(`--------------------------------------------------------`);
        console.log(`Logged in and successfully connected as ${client.user.username}.`);
        console.log(`Invite link: https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=applications.commands%20bot`);

        // Check database and initialise all tables if they don't exist
        const databaseTables = fs.readdirSync('./tables').filter(file => file.endsWith('.js'));
        // Log into the database and sync
        await database.authenticate()
            .then(() => {
                console.log();
                console.log(`Logged in to ${database.getDatabaseName()} database.`);
                databaseTables.forEach(file => {
                    const table = require(`../tables/${file}`);
                    table.init(database);
                    table.sync();
                    console.log(`Initiated table ${table.name} in ${database.getDatabaseName()}.`)
                })
            })
            .catch(err => console.error(err));
        
        // Cache any existing required RoleMessages
        const existingRoleMessages = await RoleMessages.findAll()
        existingRoleMessages.forEach(RoleMessage => {
            client.guilds.fetch(RoleMessage.dataValues.guildId)
                .then(cacheGuild => {
                    return cacheGuild.channels.fetch(RoleMessage.dataValues.channelId)
                })
                .then(cacheChannel => {
                    return cacheChannel.messages.fetch(RoleMessage.dataValues.messageId)
                })
                .then(cacheMessage => {
                    console.log(`Fetched RoleMessage ${cacheMessage.content}`)
                })
                .catch(async err => {
                    if (err instanceof DiscordAPIError) {
                        await RoleMessages.destroy({
                            where: {
                                messageId: RoleMessage.dataValues.messageId,
                                guildId: RoleMessage.dataValues.guildId,
                                channelId: RoleMessage.dataValues.channelId,
                            }
                        });
                        console.log('Previously deleted role message in database. Removing.');
                    }
                });
        });
        
        
        // Get the owner commands from the guild and set the permission to be owner-only
        const ownerPermissions = [
            {
                id: ownerId,
                type: 'USER',
                permission: true
            }
        ];

        const guild = await client.guilds.cache.get(guildId);
        client.ownerCommands.each(async ownerCommand =>{
            const guildCommand = await client.guilds.cache.get(guildId).commands.fetch()
                .then(commands => commands.find(command => command.name === ownerCommand.data.name));
            await guild.commands.permissions.add({ command: guildCommand.id, permissions: ownerPermissions });
        });

        console.log(`--------------------------------------------------------`);
    }
}