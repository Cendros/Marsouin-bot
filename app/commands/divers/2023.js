import { SlashCommandBuilder } from '@discordjs/builders';

const category = 'Divers';
const command = new SlashCommandBuilder()
	.setName('2023')
	.setDescription('Donne le nombre de jours avant 2023');
const execute = async (interaction, client) => {
	let d2023 = new Date("01/01/2023");
	let today = new Date();
	let dif = d2023 - today;
	let days = dif / (1000 * 3600 * 24);
	await interaction.reply('Il reste ' + parseInt(days) + ' jours avant 2023 !');
}

export const data = {
	category: category,
	data: command,
	execute: execute,
}