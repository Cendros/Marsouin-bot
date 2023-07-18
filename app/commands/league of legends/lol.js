import { SlashCommandBuilder } from '@discordjs/builders';
import { EmbedBuilder } from 'discord.js';

const category = 'League of Legends';
const command = new SlashCommandBuilder()
	.setName('lol')
	.setDescription('Commandes de League of Legends')
	.addSubcommand(subcommand => subcommand
		.setName('status')
		.setDescription('État du jeu'));
const execute = async (interaction, client) => {
	let subCommand = interaction.options.getSubcommand();
	if (subCommand == "status") {
		let data = await requestStatus();
		if (data == null)
			return await interaction.reply("Y'a rien");

		if (data['maintenances'].length == 0 && data['incidents'].length == 0)
			return await interaction.reply("Y'a rien");;

		let statusEmbed = new EmbedBuilder()
			.setColor(Number(`0x${Math.floor(Math.random() * 16777215).toString(16)}`));

		if (data['maintenances'].length != 0) {
			let maintenances = data['maintenances'][0]['updates'][0]['translations'];
			statusEmbed.addFields({ name: findFr(data['maintenances'][0]['titles']), value: findFr(maintenances) });
		}

		if (data['incidents'].length != 0) {
			let incidents = data['incidents'][0]['updates'][0]['translations'];
			statusEmbed.addFields({ name: findFr(data['incidents'][0]['titles']), value: findFr(incidents) });
		}

		return await interaction.reply({ embeds: [statusEmbed] });
	}
}

async function requestStatus() {
    let url = "https://euw1.api.riotgames.com/lol/status/v4/platform-data?api_key=" + process.env['riotAPIKey'];
	let data = await fetch(url, {method: 'GET'});
	if(data == null) return
	
	data = JSON.parse(data);
	return data;
}

function findFr(data) {
	for (let i in data) {
		if(data[i]['locale'] == 'fr_FR')
			return data[i]['content'];
	}
}

export const data = {
	category: category,
	data: command,
	execute: execute,
}