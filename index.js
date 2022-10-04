const { Client, Collection, GatewayIntentBits  } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const express = require('express');
const app = express();
const port = 3000;

if (process.env.NODE_ENV !== 'production') {
	require('dotenv').config();
}

const fs = require('node:fs');

const discordModals = require('discord-modals');
discordModals(client);

app.get('/', (req, res) => res.send('Je suis en vie !'));

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`));

client.commands = new Collection();
client.events = new Collection();
module.exports.client = client;

parcourirCommands("./commands/");
parcourirEvents("./events/");



client.once('ready', () => {
	console.log('Ready!');
});

client.login(process.env.token).catch(console.error);


function parcourirCommands(folder) {
	let commandFiles = fs.readdirSync(folder);
	for (const file of commandFiles) {
		if(file.endsWith('.js')) {
			const command = require(folder + file);
			client.commands.set(command.data.name, command);
		} else if(fs.statSync(folder + file).isDirectory()) {
			parcourirCommands(folder + file + "/");	
		}
	}
}

function parcourirEvents(folder) {
	let eventFiles = fs.readdirSync(folder);
	for (const file of eventFiles) {
		if(file.endsWith('.js')) {
			const event = require(folder + file);
			client.events.set(file, event);
		} else if(fs.statSync(folder + file).isDirectory()) {
			parcourirEvents(folder + file + "/");	
		}
	}
}