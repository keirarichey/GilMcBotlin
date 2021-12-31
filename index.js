const fs = require('fs');
const { Client, Intents, Collection, MessageEmbed } = require('discord.js');
const { token, ownerId, guildId, adminRoleName } = require('./config.json');

// Create a new client instance
const client = new Client({
	intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS],
	partials: ['USER', 'REACTION', 'MESSAGE', 'GUILD_MEMBER']
});

// Command Handling
client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
	const command = require(`./commands/${file}`);

	client.commands.set(command.data.name, command);
}

// Owner-only Command Handling
client.ownerCommands = new Collection();
const ownerCommandFiles = fs.readdirSync('./ownerCommands').filter(file => file.endsWith('.js'));
for (const file of ownerCommandFiles) {
	const ownerCommand = require(`./ownerCommands/${file}`);

	client.commands.set(ownerCommand.data.name, ownerCommand);
	client.ownerCommands.set(ownerCommand.data.name, ownerCommand);
}

// Event Handling
const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));
for (const file of eventFiles) {
	const event = require(`./events/${file}`);

	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

client.reactionMessages = new Collection();

// Login to Discord with your client's token
client.login(token);