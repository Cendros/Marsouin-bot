const request = require('request');
const fs = require('fs');

const aram = require('../commands/league of legends/tier_list.json');
const urf = require('../commands/league of legends/tier_list_urf.json');

async function run() {
	const champions = await requestListChampions();
	const list = {
		data: {}
	};
	for (champion in champions) {
		let id = champions[champion]['key']
		let name = champions[champion]['name']
		let champ = {
			key: champion,
			name: name,
			aram: aram[name],
			urf: urf[name],
		}
		list.data[id] = champ;
	}
	const json = JSON.stringify(list);
	fs.writeFile('tierList.json', json, 'utf8', (err) => {
		if (err)
			console.log(err);
	  	else console.log("File written successfully\n");
	});
}


async function requestListChampions() {
	let url = "https://ddragon.leagueoflegends.com/api/versions.json";
	let versions = await doRequest(url);
	versions = JSON.parse(versions);
	if(versions == null) return;
	let latest = versions[0];

	url = "https://ddragon.leagueoflegends.com/cdn/"+ latest +"/data/en_US/champion.json";
	let champions = await doRequest(url);
	champions = JSON.parse(champions);
	if(champions == null) return;
	return champions['data'];
}

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

run();