const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	category: 'Divers',
	data: new SlashCommandBuilder()
		.setName('infos')
		.setDescription('Infos sur Marsouin Bot'),
	async execute(interaction, client) {
		await interaction.reply('Marsouin Bot est en full mise à jour ! wow');
	},
};