import { SlashCommandBuilder } from '@discordjs/builders';
import { ModalBuilder, TextInputBuilder, ActionRowBuilder } from 'discord.js';

const category = 'Divers';
const command = new SlashCommandBuilder()
	.setName('sondage')
	.setDescription('Création d\'un sondage');
const execute = async (interaction, client) => {
	const modal = getModal();
	await interaction.showModal(modal);
}

function getModal() {
	const id = 'sondageModal' + Date.now();
	const modal = new ModalBuilder()
			.setCustomId(id)
			.setTitle('Création du sondage')
			.addComponents(
				
			);
	
	const question = new TextInputBuilder()
		.setCustomId('question')
		.setLabel("Question à poser")
		.setStyle('Paragraph')
		.setMaxLength(256)
		.setRequired(true);

	let actionRow = new ActionRowBuilder().addComponents(question);
	modal.addComponents(actionRow);
	
	for(let i = 1; i < 5; i++) {
		const id = 'reponse' + i;
		const label = 'Reponse ' + i;
		const reponse = new TextInputBuilder()
			.setCustomId(id)
			.setLabel(label)
			.setStyle('Short')
			.setRequired(false);
		if (i == 1 || i == 2)
			reponse.setRequired(true);
		let actionRow = new ActionRowBuilder().addComponents(reponse);
		modal.addComponents(actionRow);
	}
	return modal;
}

export const data = {
	category: category,
	data: command,
	execute: execute,
}