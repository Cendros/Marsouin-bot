import { SlashCommandBuilder } from '@discordjs/builders';
import { ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, StringSelectMenuOptionBuilder, ButtonStyle } from 'discord.js';

const category = 'Roles';

const command = new SlashCommandBuilder()
	.setName('role')
	.setDescription('gestion des rôles.')
	.addSubcommand(subcommand => subcommand
		.setName('gestion')
		.setDescription('gestion des rôles'))
	.addSubcommand(subcommand => subcommand
		.setName('create')
		.setDescription('Création d\'un rôle')
		.addStringOption(option => option.setName('rôle')
			.setDescription('Nom du rôle')
			.setRequired(true)));

const execute = async (interaction, client) => {
	let subCommand = interaction.options.getSubcommand();
	if (subCommand == "gestion") {
		let components = getComponents(interaction);

		await interaction.reply({ content: 'Selectionner un rôle.', components: components });

		const collector = interaction.channel.createMessageComponentCollector({});

		let currentRole = "";

		collector.on('collect', async (i) => {
			let components = getComponents(interaction);
			if (i.customId === 'select') {
				i.deferUpdate();
				currentRole = i.values[0];
				return;
			}
			if (i.customId === 'ajouter') {
				i.deferUpdate();
				const role = interaction.guild.roles.cache.find(r => r.id == currentRole);
				if (i.member.roles.cache.some(r => r == role))
					return await interaction.editReply({ content: 'Vous possédez déjà le rôle ' + role.name + ' !', components: components });

				i.member.roles.add(role).catch(console.error);
				return await interaction.editReply({ content: 'Le rôle ' + role.name + ' a été ajouté ✅', components: components });
			}
			if (i.customId === 'retirer') {
				i.deferUpdate();
				const role = interaction.guild.roles.cache.find(r => r.id == currentRole);
				if (role == null)
					return await interaction.editReply({ content: 'Ce rôle n\'existe pas', components: components });
				if (!i.member.roles.cache.some(r => r == role))
					return await interaction.editReply({ content: 'Vous ne possédez pas le rôle ' + role.name + ' !', components: components });

				i.member.roles.remove(role).catch(console.error);
				await interaction.editReply({ content: 'Le rôle ' + role.name + ' a été retiré ✅', components: components });
			}
		});
		return;
	}
	if (subCommand == "create") {
		const option = interaction.options.getString("rôle");
		if (!interaction.member.roles.cache.some(r => r.id == "882349034231189604"))
			return await await interaction.reply({ content: 'Vous ne pouvez pas utiliser cette commande !', ephemeral: true });
		const role = interaction.guild.roles.cache.find(r => r.name === option);
		if (role != null)
			return await interaction.reply("Ce rôle existe déjà !");
		interaction.guild.roles.create({
			name: option,
			color: 15277667,
			mentionable: true,
		});
		return await interaction.reply("Rôle " + option + " créé :white_check_mark:");
	}
}

function getRoles(interaction) {
	let list = [];
	interaction.guild.roles.cache.forEach(r => {
		if (r.color == 15277667) list.push(r)
	});
	return list;
}

function getOptions(interaction) {
	let options = [];
	const roles = getRoles(interaction);
	roles.forEach(role => {
		options.push(
			new StringSelectMenuOptionBuilder()
				.setLabel(role)
				.setValue(role)
		);
	});
	return options;
}

function getComponents(interaction) {
	const row = new ActionRowBuilder()
		.addComponents(
			new StringSelectMenuBuilder()
				.setCustomId('select')
				.setPlaceholder('Rôle')
				.addOptions(getOptions(interaction))
		);
	const row2 = new ActionRowBuilder()
	.addComponents(
		new ButtonBuilder()
			.setCustomId('ajouter')
			.setLabel('Ajouter')
			.setStyle(ButtonStyle.Success)
	)
	.addComponents(
		new ButtonBuilder()
			.setCustomId('retirer')
			.setLabel('Retirer')
			.setStyle(ButtonStyle.Danger)
	);
	return [row, row2];
}

export const data = {
	category: category,
	data: command,
	execute: execute,
}