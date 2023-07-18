import { Events } from 'discord.js';

const name = Events.InteractionCreate;
const execute = async interaction => {
    if (!interaction.isCommand()) return;

	console.log(interaction.commandName + ' called');

	const command = interaction.client.commands[interaction.commandName];

	if (!command) return await interaction.reply({ content: "Cette commande n'est pas activée ! ", ephemeral: true });

	try {
		await command.execute(interaction, interaction.client);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'Il y a eu un problème avec l\'exécution de la commande !', ephemeral: true });
	}
}

export const data = {
    name: name,
    execute: execute
}