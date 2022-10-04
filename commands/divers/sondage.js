const { SlashCommandBuilder } = require('@discordjs/builders');
const { Modal, TextInputComponent, showModal } = require('discord-modals');

module.exports = {
	category: 'Divers',
	data: new SlashCommandBuilder()
		.setName('sondage')
		.setDescription('Création d\'un sondage'),
	async execute(interaction, client) {	
		const modal = getModal();
		showModal(modal, {
			client: client,
			interaction: interaction,
		});
	},
};

function getModal() {
	const id = 'sondageModal' + Date.now();
	const modal = new Modal()
			.setCustomId(id)
			.setTitle('Création du sondage')
			.addComponents(
				new TextInputComponent()
					.setCustomId('question')
					.setLabel("Question à poser")
					.setStyle('LONG')
					.setMaxLength(256)
					.setRequired(true)
			);
		
	for(let i = 1; i < 5; i++) {
		const id = 'reponse' + i;
		const label = 'Reponse ' + i;
		const reponse = new TextInputComponent()
		.setCustomId(id)
		.setLabel(label)
		.setStyle('SHORT');
		if (i == 1 || i == 2)
			reponse.setRequired(true);
	modal.addComponents(reponse);
	}
	return modal;
}