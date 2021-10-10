const fs = require('fs');
const Sequelize = require('sequelize');
const { Client, Collection, Intents } = require('discord.js');
const { token } = require('./config.json');

const client = new Client({ intents: [Intents.FLAGS.GUILDS,Intents.FLAGS.GUILD_VOICE_STATES,Intents.FLAGS.GUILD_MEMBERS] });

// Handle text commands
client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.data.name, command);
}

client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

	const command = client.commands.get(interaction.commandName);

	if (!command) return;

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		return interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});

// Read in event handlers
const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	const event = require(`./events/${file}`);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

const sequelize = new Sequelize('database', 'user', 'password', {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	// SQLite only
	storage: 'database.sqlite',
});

/*
 * equivalent to: CREATE TABLE tags(
 * name VARCHAR(255) UNIQUE,
 * description TEXT,
 * username VARCHAR(255),
 * usage_count  INT NOT NULL DEFAULT 0
 * );
 */
const attendance = sequelize.define('attendance', {
	discordid: {
		type: Sequelize.STRING,
	},
	start_time: {
		type: Sequelize.INTEGER,
		defaultValue: 0,
		allowNull: false,
	},
	time_logged: {
		type: Sequelize.INTEGER,
		defaultValue: 0,
		allowNull: false,
	},
});
const startTable = sequelize.define('startTable', {
	discordid: {
		type: Sequelize.STRING,
		unique: true,
	},
	start_time: {
		type: Sequelize.INTEGER,
		defaultValue: 0,
		allowNull: false,
	}
});
global.table = attendance;
global.temp = startTable;
client.login(token);

