const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	category: 'Divers',
	data: new SlashCommandBuilder()
		.setName('marsouin')
		.setDescription('infos sur le bot')
		.addSubcommand(subcommand =>
			subcommand
				.setName('land')
				.setDescription('Lien du site Marsouin Land')),
	async execute(interaction, client) {
		await interaction.reply('https://marsouin-land.cendros.repl.co/');
	},
};