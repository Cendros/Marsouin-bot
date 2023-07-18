import { SlashCommandBuilder } from '@discordjs/builders';

const category = 'Divers';
const command = new SlashCommandBuilder()
	.setName('marsouin')
	.setDescription('infos sur le bot')
	.addSubcommand(subcommand => subcommand
		.setName('land')
		.setDescription('Lien du site Marsouin Land'));
const execute = async (interaction, client) => {
	await interaction.reply('https://marsouin-land.cendros.repl.co/');
}

export const data = {
	category: category,
	data: command,
	execute: execute,
}