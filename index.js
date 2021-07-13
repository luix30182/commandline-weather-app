require('dotenv').config();

const inquirer = require('inquirer');
const {
	readInput,
	inquirerMenu,
	pause,
	listPlaces,
} = require('./helpers/inquirer');
const Search = require('./models/search');

const main = async () => {
	const searh = new Search();
	let opt;

	do {
		opt = await inquirerMenu();

		switch (opt) {
			case 1:
				const searchTerm = await readInput('City:');
				const places = await searh.city(searchTerm);
				const id = await listPlaces(places);

				if (id === '0') continue;

				const placeSelected = places.find((place) => place.id === id);

				searh.addToHistory(placeSelected.name);

				const weather = await searh.getWeather(
					placeSelected.lat,
					placeSelected.lng
				);

				console.clear();
				console.log(`
				${'Weather city info'.green}
				City: ${placeSelected.name}
				Lat:  ${placeSelected.lat}
				Long: ${placeSelected.lng}
				Temp: ${weather.temp}
				Min: ${weather.min}
				Max: ${weather.max}
				Hows the weather: ${weather.desc}
				`);

				break;
			case 2:
				searh.history.forEach((place, i) => {
					const index = `${i + 1}`.green;
					console.log(`${index} ${place}`);
				});
				break;
		}

		if (opt !== 0) await pause();
	} while (opt !== 0);
};

main();
