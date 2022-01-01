const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { token, guildId, clientId } = require('./config.json');
const fs = require('fs');

const commands = [];

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
const ownerCommandFiles = fs.readdirSync('./ownerCommands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	commands.push(command.data.toJSON());
}
for (const file of ownerCommandFiles) {
	const ownerCommand = require(`./ownerCommands/${file}`);
	commands.push(ownerCommand.data.toJSON());
}

const rest = new REST({ version: '9' }).setToken(token);

(async () => {
	try {
		console.log('Started refreshing application (/) commands.');
		console.log(clientId, guildId);

		await rest.put(
			Routes.applicationGuildCommands(clientId, guildId),
			{ body: commands },
		);

		console.log('Successfully reloaded application (/) commands.');
	} catch (error) {
		console.error(error);
	}
})();