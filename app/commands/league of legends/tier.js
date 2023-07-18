import { SlashCommandBuilder, SlashCommandStringOption } from '@discordjs/builders';
import { EmbedBuilder, MessageAttachment } from 'discord.js';
import { registerFont, createCanvas, loadImage } from 'canvas';
import { join } from 'path';
import { readFileSync } from 'fs';

const tierList = readFileSync('./tierList.json');

const category = 'League of Legends';
const command = new SlashCommandBuilder()
	.setName('tier')
	.setDescription('Calcul le tier de la game')
	.addSubcommand(subcommand => subcommand
		.setName('champion')
		.setDescription('Donne le tier d\'un champion')
		.addStringOption(option => option.setName('champion')
			.setDescription('Nom du champion')
			.setRequired(true)))
	.addSubcommand(subcommand => subcommand
		.setName('game')
		.setDescription('Donne le tier de la game')
		.addStringOption(option => option.setName('pseudo')
			.setDescription('Nom d\'invocateur')
			.setRequired(true)));
const execute = async (interaction, client) => {
	let subCommand = interaction.options.getSubcommand();
	if (subCommand == "champion") {
		const champion = interaction.options.getString("champion");
		for (id in tierList['data']) {
			if (tierList['data'][id]['name'].toLowerCase() == champion.toLowerCase()) {
				tierEmbed = new EmbedBuilder()
					.setColor(Number(`0x${Math.floor(Math.random() * 16777215).toString(16)}`))
					.setTitle(tierList['data'][id]['name'])
					.setThumbnail('https://opgg-static.akamaized.net/images/lol/champion/' + tierList['data'][id]['key'] + '.png')
					.addFields({ name: 'ARAMㅤ', value: ":regional_indicator_" + tierList['data'][id]['aram'].toLowerCase() + ":", inline: true },
						{ name: 'URF', value: ":regional_indicator_" + tierList['data'][id]['urf'].toLowerCase() + ":", inline: true });
				return await interaction.reply({ embeds: [tierEmbed] });
			}
		}
		return await interaction.reply("Ce champion n'existe pas.");
	}
	else if (subCommand == "game") {
		await interaction.deferReply();
		const summonerName = interaction.options.getString("pseudo");
		const id = await requestSummonerData(summonerName);
		if (id == null)
			return await interaction.editReply("Cet invocateur n'existe pas !");
		let teams = await requestGameData(id);
		if (teams == null)
			return await interaction.editReply("Cet invocateur n'est pas en game !");
		if (teams == 'gameModeError')
			return await interaction.editReply("Ce mode de jeu n'est pas supporté !");
		let image = await makeImage(teams);
		const attachment = new MessageAttachment(image.toBuffer(), 'image.png');
		await interaction.editReply(({ files: [attachment] }));
	}
}

async function requestListChampions() {
	let url = "https://ddragon.leagueoflegends.com/api/versions.json";
	let versions = await fetch(url, {method: 'GET'});
	versions = JSON.parse(versions);
	if(versions == null) return;
	let latest = versions[0];

	url = "https://ddragon.leagueoflegends.com/cdn/"+ latest +"/data/en_US/champion.json";
	let champions = await fetch(url, {method: 'GET'});
	champions = JSON.parse(champions);
	if(champions == null) return;
	return champions['data'];
}

async function requestSummonerData(summonerName) {
    let url = "https://euw1.api.riotgames.com/lol/summoner/v4/summoners/by-name/" + summonerName + "?api_key=" + process.env['riotAPIKey'];
	let data = await fetch(url, {method: 'GET'});
	if(data == null) return
	
	let list = JSON.parse(data);
	return list['id'];
}

async function requestGameData(summonerId) {
    let url = "https://euw1.api.riotgames.com/lol/spectator/v4/active-games/by-summoner/" + summonerId + "?api_key=" + process.env['riotAPIKey'];
	let data;
	try {
		data = await fetch(url, {method: 'GET'});
	} catch (error) {
		console.log(error);
		return;
	}
	if(data == null) return;

	let list = JSON.parse(data);
	let gameMode = list['gameMode'].toLowerCase();
	if(gameMode != 'aram' && gameMode != 'urf')
		return 'gameModeError';
	list = list['participants'];

	let bleue = [];
	for(let i = 0; i < 5; i++) {
		let championId = list[i]['championId'];
		let tier = tierList['data'][championId][gameMode];
		bleue.push({
			summonerName: list[i]['summonerName'],
			championId: championId,
			tier: tier
		});
	}
	let rouge = [];
	for(let i = 5; i < 10; i++) {
		let championId = list[i]['championId'];
		let tier = tierList['data'][championId][gameMode]; 
		rouge.push({
			summonerName: list[i]['summonerName'],
			championId: championId,
			tier: tier
		});
	}

	return { bleue: bleue, rouge: rouge, gameMode: gameMode };
}

async function makeImage(teams) {
	let background;
	let tier;
	let summonerName;
	let image;
	let gameMode = teams['gameMode'];
	let tierBleu = teamTier(teams['bleue'], gameMode);
	let tierRouge = teamTier(teams['rouge'], gameMode);

	registerFont(join(__dirname, '..', '..', 'utils', 'Dela.ttf'), { family: 'Dela' });

	const ratio = 1.5;
	const w = 940 / ratio;
	const h = 180 / ratio;
	const offset = w * 0.1;
	const textWidth = w * 0.3;

	const ratioTier = 0.8;
	const wTier = 159 / ratio * ratioTier; 
	const hTier = 180 / ratio * ratioTier;
	
	const canvas = createCanvas(w * 2, h * 6 );
	const context = canvas.getContext('2d');
	let bgTier;
	if (gameMode == 'aram') {
		image = await loadImage('https://imgur.com/yToeHsj.png');
	} else if (gameMode == 'urf') {
		image = await loadImage('https://imgur.com/3vAHcjq.png');
	}
	context.drawImage(image, 0, 0, w * 2, h);
	//return canvas;

	if(tierBleu.length == 1) {
		image = await loadImage(tierToLink(tierBleu[0]));
			context.drawImage(image, w / 2 - wTier / 2, 0 + (h - hTier) / 2, wTier, hTier);
	} else {
		image = await loadImage(tierToLink(tierBleu[0]));
		context.drawImage(image, w / 2 - wTier, 0 + (h - hTier) / 2, wTier, hTier);
		image = await loadImage(tierToLink(tierBleu[1]));
		context.drawImage(image, w / 2, 0 + (h - hTier) / 2, wTier, hTier);
	}

	if(tierRouge.length == 1) {
		image = await loadImage(tierToLink(tierRouge[0]));
		context.drawImage(image, w + w / 2 - wTier / 2, 0 + (h - hTier) / 2, wTier, hTier);
	} else {
		image = await loadImage(tierToLink(tierRouge[0]));
		context.drawImage(image, w + w / 2 - wTier, 0 + (h - hTier) / 2, wTier, hTier);
		image = await loadImage(tierToLink(tierRouge[1]));
		context.drawImage(image, w + w / 2, 0 + (h - hTier) / 2, wTier, hTier);
	}
	
	let bleue = teams['bleue'];
	for(let i = 1; i < 6; i++) {
		let e = bleue[i - 1];
		image = await loadImage('https://lolg-cdn.porofessor.gg/img/d/champion-banners/' + e['championId'] + '.jpg');
		context.drawImage(image, 0, h * i, w, h);
		
		image = await loadImage(tierToLink(e['tier']));
		context.drawImage(image, w - wTier - offset, h * i + (h - hTier) / 2, wTier, hTier);

		let summonerName = e['summonerName'];
		context.font = applyText(canvas, summonerName, textWidth);
		let height = parseInt(context.font.match(/\d+/), 10);
		context.fillStyle = '#ffffff';
		context.fillText(summonerName, 0 + offset / 4, h * i + h / 2 + height / 2);
	}

	let rouge = teams['rouge'];
	for(let i = 1; i < 6; i++) {
		let e = rouge[i - 1];
		image = await loadImage('https://lolg-cdn.porofessor.gg/img/d/champion-banners/' + e['championId'] + '.jpg');
		context.drawImage(image, w, h * i, w, h);

		image = await loadImage(tierToLink(e['tier']));
		context.drawImage(image, w + offset,  h * i + (h - hTier) / 2, wTier , hTier);

		let summonerName = e['summonerName'];
		context.font = applyText(canvas, summonerName, textWidth);
		let height = parseInt(context.font.match(/\d+/), 10);
		context.fillStyle = '#ffffff';
		context.fillText(summonerName, w * 2 - offset / 4 - context.measureText(summonerName).width, h * i + h / 2 + height / 2);
	}

	return canvas;
}

function applyText(canvas, text, width) {
	const context = canvas.getContext('2d');
	let fontSize = 100;
	do {
		context.font = `${fontSize -= 3}px Dela`;
	} while (context.measureText(text).width > width);
	return context.font;
};

function teamTier(team, gameMode) {
	let score = 0;
	let champToPoint = {'S':5, 'A':4, 'B':3, 'C':2, 'D':1};
	team.forEach(e => {
		const id = e['championId'];
		const tier = tierList['data'][id][gameMode];
		score += champToPoint[tier];
	});
	return getTeamTier(score);
}

function getTeamTier(score) {
	if(score == 5) return 'D-';
	if(score <= 7) return 'D';
	if(score <= 8) return 'D+';
	if(score <= 10) return 'C-';
	if(score <= 11) return 'C';
	if(score <= 13) return 'C+';
	if(score <= 14) return 'B-';
	if(score <= 15) return 'B';
	if(score <= 16) return 'B+';
	if(score <= 18) return 'A-';
	if(score <= 19) return 'A';
	if(score <= 21) return 'A+';
	if(score <= 22) return 'S-';
	if(score <= 24) return 'S';
	if(score == 25) return 'S+';
}

function tierToLink(tier) {
	switch (tier) {
		case 'S':
			return 'https://imgur.com/4l3nriR.png';
		case 'A':
			return 'https://imgur.com/5Uw2ijQ.png';
		case 'B':
			return 'https://imgur.com/44jzawD.png';
		case 'C':
			return 'https://imgur.com/AspIcAE.png';
		case 'D':
			return 'https://imgur.com/qj1JfJ6.png';
		case '-':
			return 'https://imgur.com/6FDc4HH.png';
		case '+':
			return 'https://imgur.com/a4u0mJO.png';
		default:
			return;
	}
}

export const data = {
	category: category,
	data: command,
	execute: execute,
}