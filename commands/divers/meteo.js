const { SlashCommandBuilder } = require('@discordjs/builders');
const request = require('request');
const { MessageEmbed } = require('discord.js');

module.exports = {
	category: 'Divers',
	data: new SlashCommandBuilder()
		.setName('meteo')
		.setDescription('Donne la météo')
		.addStringOption(option =>
			option.setName('ville')
			.setDescription('Ville à chercher')
			.setRequired(true)),
	async execute(interaction, client) {
		//await interaction.deferReply();
		const ville = interaction.options.getString("ville");
		const url = 'http://api.openweathermap.org/data/2.5/weather?q=' + ville + '&appid=' + process.env['meteoAPIKey'] + '&units=metric';
		let data = await doRequest(url);
		if(data == null)
			return await interaction.reply('Impossible de trouver la météo de ' + ville + '.');
		data = JSON.parse(data);
		console.log(data);
		
		let temp = data.main.temp;
		let ressenti = data.main.feels_like;
		let min = data.main.temp_min;
		let max = data.main.temp_max;
		
		temp = temp.toFixed(1) + ' °C';
		ressenti = ressenti.toFixed(1) + ' °C';
		const minMax = min.toFixed(1) + '°C/' + max.toFixed(1) + '°C';
		const title = 'Météo de ' + data.name;
		const temps = getTemps(data.weather[0].main);
		
		const embed = new MessageEmbed()
			.setColor('RANDOM')
			.setTitle(title)
			.setDescription(temp)
			.addFields(
				{ name: 'Ressenti', value: ressenti, inline: true },
				{ name: 'Min/Max', value: minMax, inline: true },
				{ name: '\u200B', value: '\u200B' },
			)
			.setTimestamp()
		if(temps != null)
			embed.setThumbnail(temps)
		else console.log(data.weather.main);

		return await interaction.reply({ embeds: [embed] });
	},
};

function doRequest(url) {
	return new Promise(function (resolve, reject) {
    	request(encodeURI(url), function (error, res, body) {
    		if (!error && res.statusCode == 200) {
    			resolve(body);
      		} else {
        		reject(error);
     		}
    	});
  	});
}

function getTemps(temps) {
	const images = {
		'Clear': [
			'https://imgur.com/axYh8c8.png',
			'https://imgur.com/leIrlv5.png',
			'https://imgur.com/hoZNqM4.png',
			'https://imgur.com/BR2Pupu.png',
			'https://imgur.com/IbwFHnK.png',
			'https://imgur.com/lGD2jw6.png'
		],
		'Clouds': [
			'https://imgur.com/NvklgsI.png',
			'https://imgur.com/JJGzGwT.png',
			'https://imgur.com/rIbiZ5g.png',
			'https://imgur.com/f0L0WS9.png'
		],
		'Rain': [
			'https://imgur.com/9bTTdBV.png',
			'https://imgur.com/KyKxTJ7.png',
			'https://imgur.com/hCc1Dto.png',
			'https://imgur.com/04W99hT.png'
		],
		'Thunderstorm': [
			'https://imgur.com/Tv4vkr6.png'
		],
		'Fog': [
			'https://imgur.com/0ohlNnr.png'
		]
		
	}
	if(images[temps] == null)
		return null;
	const array = images[temps];
	const image = array[Math.floor(Math.random()*array.length)];
	console.log(temps, image)
	return image;
}