import { SlashCommandBuilder } from '@discordjs/builders';

const category = 'Divers';
const command = new SlashCommandBuilder()
	.setName('infos')
	.setDescription('Infos sur Marsouin Bot');
const execute = async (interaction, client) => {
	await interaction.reply('Marsouin Bot est en full mise à jour ! wow');
}

export const data = {
	category: category,
	data: command,
	execute: execute,
}