const fs = require('node:fs');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { clientId } = require('./config.json');

const commands = [];
parcourir("./commands/");

const rest = new REST({ version: '9' }).setToken(process.env.token);

rest.put(Routes.applicationCommands(clientId), { body: commands })
	.then(() => console.log('Successfully registered application commands.'))
	.catch(console.error);

function parcourir(folder) {
	let commandFiles = fs.readdirSync(folder);
	for (const file of commandFiles) {
		if(file.endsWith('.js')) {
			const command = require(folder + file);
			commands.push(command.data.toJSON());
		} else if(fs.statSync(folder + file).isDirectory()) {
			parcourir(folder + file + "/");	
		}
	}
}