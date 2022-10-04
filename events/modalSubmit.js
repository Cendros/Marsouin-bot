const { MessageEmbed, MessageActionRow, MessageSelectMenu } = require('discord.js');
const client = require('../index').client;

client.on('modalSubmit', async (modal) => {
	if(modal.customId.startsWith('sondageModal')) {
		
		const reponse1 = modal.getTextInputValue('reponse1');
		const reponse2 = modal.getTextInputValue('reponse2');
		const reponse3 = modal.getTextInputValue('reponse3');
		const reponse4 = modal.getTextInputValue('reponse4');

		let reponses = [];
		reponses[reponse1] = 0;
		reponses[reponse2] = 0;
		reponses[reponse3] = 0;
		reponses[reponse4] = 0;

		let participants = [];
		const components = getComponents(modal);
		
		const collector = modal.channel.createMessageComponentCollector({});

		collector.on('collect', async (i) => {			
			if(i.customId.startsWith('select')) {
				const user = i.member.user.username;
				let choix = i.values[0];
				if(!(choix in reponses))
					return;
				try {
					if(!participants.includes(user)) {
						i.deferUpdate();
						participants.push(user);
						reponses[choix] = reponses[choix] + 1;
						//let str = 'Vous avez voté ' + choix;
						return await modal.editReply({ embeds: [ getEmbed(modal, participants, reponses) ], components: [ components ] });
					} else return await i.reply({ content: 'Vous avez déjà voté !', ephemeral: true });
				} catch(e) {
					console.log(e);
					return await i.reply({ content: 'Ce sondage est terminé !', ephemeral: true });
				}
			}
		});

		try {
			await modal.reply({ embeds: [ getEmbed(modal, participants, reponses) ], components: [ components ] });
		} catch(e) {
			return modal.reply({ content: 'Vous ne pouvez pas mettre deux fois la même réponse.', ephemeral: true });
		}
	}
});

function getEmbed(modal, participants, reponses) {
	const question = modal.getTextInputValue('question');
	const reponse1 = modal.getTextInputValue('reponse1');
	const reponse2 = modal.getTextInputValue('reponse2');
	const reponse3 = modal.getTextInputValue('reponse3');
	const reponse4 = modal.getTextInputValue('reponse4');
	
	const name = modal.member.user.username + ' a lancé un sondage !';
	const votes = participants.length + ' votes';
	const embed = new MessageEmbed()
	.setColor('RANDOM')
	.setTitle(question)
	.setDescription(votes)
	.setAuthor({ name: name, iconURL: modal.member.user.displayAvatarURL() })
	.addFields(
		{ name: '\u200B', value: '\u200B' },
		{ name: reponse1, value: getValue(participants, reponses[reponse1]) },
		{ name: reponse2, value: getValue(participants, reponses[reponse2]) },
	)
	.setTimestamp()
	.setFooter({ text: 'Disponible pendant 15 minutes' });

	if(reponse3 != null) {
		embed.addFields(
			{ name: reponse3, value: getValue(participants, reponses[reponse3]) },
		);
	}
	if(reponse4 != null) {
		embed.addFields(
			{ name: reponse4, value: getValue(participants, reponses[reponse4]) },
		);
	}

	embed.addFields(
			{ name: '\u200B', value: '\u200B' },
		);
	return embed;
}

function getComponents(modal) {
	const id = 'select' + modal.customId
	const row = new MessageActionRow()
		.addComponents(
		new MessageSelectMenu()
			.setCustomId(id)
			.setPlaceholder('Réponse')
			.addOptions(getOptions(modal))
		);
	return row;
}

function getOptions(modal) {
	let options = [];
	const reponse1 = modal.getTextInputValue('reponse1');
	const reponse2 = modal.getTextInputValue('reponse2');
	const reponse3 = modal.getTextInputValue('reponse3');
	const reponse4 = modal.getTextInputValue('reponse4');
	options.push({
		label: reponse1,
		value: reponse1,
	});
	options.push({
		label: reponse2,
		value: reponse2,
	});
	if(reponse3 != null) {
		options.push({
			label: reponse3,
			value: reponse3,
		});
	}
	if(reponse4 != null) {
		options.push({
			label: reponse4,
			value: reponse4,
		});
	}
	return options;
}

function getValue(participants, reponse) {
	if(participants.length == 0)
		return '□□□□□□□□□□ 0% (0 votes)';
	let pourcentage = reponse / participants.length * 100;
	let remplis = parseInt((pourcentage / 10), 10);
	let str = '';
	for(let i = 0; i < remplis; i++) {
		str += '■';
	}
	for(let i = 0; i < 10 - remplis; i++) {
		str += '□';
	}
	str += ' ' + parseInt(pourcentage, 10) + '% (' + reponse + ' votes)';
	return str;
}