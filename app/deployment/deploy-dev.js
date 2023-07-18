import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import { getFiles } from '../utils/file.js';
import 'dotenv/config';

const commands = await getFiles(process.env.NODE_ENV == 'development' ? 'app/commands' : 'commands');
const commandsData = [];

for (const command of Object.values(commands)) {
	commandsData.push(command.data.toJSON())
}

const rest = new REST({ version: '9' }).setToken(process.env.TOKEN);

rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), { body: commandsData })
	.then(() => console.log('Successfully registered application commands.'))
	.catch(console.error);


