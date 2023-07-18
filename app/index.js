import { Client, GatewayIntentBits } from 'discord.js';
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
import discordModals from 'discord-modals';
import express from 'express';
import { getFiles } from './utils/file.js';
import 'dotenv/config';

const app = express();
const port = 3000;

const commandsFiles = process.env.NODE_ENV == 'development' ? 'app/commands' : 'commands';
const eventsFiles = process.env.NODE_ENV == 'development' ? 'app/events' : 'events';

discordModals(client);

app.listen(port, () => console.log(`Marsouin Bot listening on port ${port}`));	

try {

	client.commands = await getFiles(commandsFiles);

	const events = await getFiles(eventsFiles);
	for (const event of Object.values(events)) {
		if (event.once)
			client.once(event.name, (...args) => event.execute(...args));
		else client.on(event.name, (...args) => event.execute(...args));
	}
} catch (error) {
	console.error(error);
}
client.login(process.env.TOKEN).catch(console.error);

const _client = client;
export { _client as client };