import { SlashCommandBuilder } from '@discordjs/builders';
import { load } from 'cheerio';
import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import pkg from 'axios';
const { get } = pkg;

const category = 'Divers';
const command = new SlashCommandBuilder()
	.setName('definition')
	.setDescription('Définition d\'un mot')
	.addStringOption(option => option.setName('mot')
		.setDescription('Mot à chercher')
		.setRequired(true));
const execute = async (interaction, client) => {
	await interaction.deferReply();
	let mot = interaction.options.getString("mot");
	mot = mot.replace(/\s/, '-');
	let baseMot = mot;
	let stack = [];
	let proxy = {};

	let url = getUrl(mot);
	let $ = await getDom(url);
	let definitions = getDefinitions($);

	if (definitions.length == 0)
		return await interaction.editReply('Aucune définition de ' + mot);

	let renvois = getRenvois(definitions);
	let embed = getEmbed(mot, url, definitions);

	let components = getComponents(renvois);
	if (components == null)
		return await interaction.editReply({ embeds: [embed] });
	let object = {
		message: {
			embeds: [embed],
			components: [components]
		},
		renvois: renvois
	};
	if (renvois.length > 0) {
		const collector = await interaction.channel.createMessageComponentCollector({});
		collector.on('collect', async (i) => {
			if (i.deferred == false && i.replied == false) {
				try {
					await i.deferUpdate();
				} catch (e) {
				}
			}
			if (i.customId.startsWith('back')) {
				let verif = 'back' + baseMot;
				if (i.customId == verif) {
					try {
						object = stack.pop();
						renvois = object.renvois;
						return await interaction.editReply(object.message);
					} catch (e) {
						return;
					}
				} else return;
			}
			mot = i.customId;
			if (!renvois.includes(mot)) return;
			stack.push(object);
			if (mot in proxy) {
				renvois = proxy[mot].renvois;
				return await interaction.editReply(proxy[mot].message);
			}
			url = getUrl(mot);
			$ = await getDom(url);
			definitions = getDefinitions($);
			if (definitions.length == 0)
				return await interaction.editReply('Aucune définition de ' + mot);
			renvois = getRenvois(definitions);
			embed = getEmbed(mot, url, definitions);
			components = getComponents(renvois, baseMot);
			let message = components == null ? { embeds: [embed], components: [] } : { embeds: [embed], components: [components] };
			object = {
				message: message,
				renvois: renvois
			};
			proxy[mot] = object;
			await interaction.editReply(object.message);
		});
	}

	await interaction.editReply(object.message);
}

async function getDom(url) {
	const response = await get(url);
	return load(response.data);
}

function digitToSuperscript(digit) {
    let result = "¹²³⁴⁵⁶⁷⁸⁹";
    return result[digit - 1];
}

function getComponents(renvois, mot = null) {
	if(renvois.length == 0 && mot == null)
		return null;
	const row = new ActionRowBuilder();
	if(mot != null) {
		row.addComponents(
			new ButtonBuilder()
				.setCustomId('back' + mot)
				.setEmoji('◀️')
				.setStyle(ButtonStyle.Primary)
		);
	}
	if(renvois.length != 0) {
		renvois.forEach((mot) => {
			row.addComponents(
				new ButtonBuilder()
					.setCustomId(mot)
					.setLabel(mot)
					.setStyle(ButtonStyle.Primary)
			);
		});
	}
	return row;
}

function getUrl(mot) {
	return 'https://www.larousse.fr/dictionnaires/francais/' + mot;
}

function getDefinitions($) {
	let definitions = [];
	$('ul[class="Definitions"]').first().find('li').each((i, li) => {
		let def = {};
		let text = $(li).contents().filter(function() {
			return this.type === 'text';
		}).text().replace(/\t/g, '').replace(/\n/g, '');
		let attr = $(li).attr('class');
		def[attr] = text;
		$(li).children().each((j, child) => {
			let text = $(child).text();
			let attr = $(child).attr('class');
			if(attr in def)
				attr = 'Contraires';
			def[attr] = text;
		});
		definitions.push(def);
	}).get();
	return definitions;
}

function getRenvois(definitions) {
	let renvois = [];
	definitions.forEach((def) => {
		if('Renvois' in def)
			renvois.push(def['Renvois']);
	});
	return renvois;
}

function getEmbed(mot, url, definitions) {
	let cpt = 0;
	const titre = "Définition de " + mot;
	const embed = new EmbedBuilder()
		.setColor(Number(`0x${Math.floor(Math.random()*16777215).toString(16)}`))
		.setTitle(titre)
		.setURL(url);
	definitions.forEach((def) => {
		let name = "";
		if('numDef' in def)
			name += def['numDef'] + " ";
		if('indicateurDefinition' in def)
			name += def['indicateurDefinition'];
		if('RubriqueDefinition' in def)
			name += def['RubriqueDefinition'];
		
		let value = `\`\`\`yaml\n` + def['DivisionDefinition'];
		if('ExempleDefinition' in def)
			value += def['ExempleDefinition'];
		value += `\`\`\``;
		if('Renvois' in def) {
			cpt++;
			let match = /\s{2}/.exec(value.substring(8));
			let match2 = /\s\./.exec(value.substring(8));
			if(match) {
				index = match.index;
				value = value.substring(0, index + 9) + def['Renvois'] + digitToSuperscript(cpt) + value.substring(index + 9);
			}else if (match2) {
				index = match2.index;
				value = value.substring(0, index + 9) + def['Renvois'] + digitToSuperscript(cpt) + value.substring(index + 9);
			}
			else if(value.includes(';')) {
				let str = value.split(';');
				value = str[0] + def['Renvois'] + digitToSuperscript(cpt) + ";" + str[1];
			} else value += def['Renvois'];
		}
		if('Synonymes' in def)
			value += "\n__Synonymes__ : *" + def['Synonymes'] + "*";
		if('Contraires' in def)
			value += "\n__Contraires__ : *" + def['Contraires'] + "*";
		if(name == "")
			name = "1.";
		embed.addFields({ name: name, value: value });
	});
	return embed;
}

export const data = {
	category: category,
	data: command,
	execute: execute,
}