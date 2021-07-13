const fs = require('fs');
const axios = require('axios');

class Search {
	history = [];
	dir = './db';
	file = `${this.dir}/data.json`;

	constructor() {
		this.readDb();
	}

	get paramsMapbox() {
		return {
			access_token: process.env.MAPBOX_KEY,
			limit: 5,
			language: 'es',
		};
	}

	get paramsOpenWeather() {
		return {
			appid: process.env.OPEN_WEATHER,
			units: 'metric',
		};
	}

	async city(place = '') {
		try {
			const instance = axios.create({
				baseURL: `https://api.mapbox.com/geocoding/v5/mapbox.places/${place}.json`,
				params: this.paramsMapbox,
			});

			const resp = await instance.get();

			return resp.data.features.map((place) => ({
				id: place.id,
				name: place.place_name,
				lng: place.center[0],
				lat: place.center[1],
			}));
		} catch (e) {
			return [];
		}
	}

	async getWeather(lat, lon) {
		try {
			const instance = axios.create({
				baseURL: `https://api.openweathermap.org/data/2.5/weather`,
				params: { lat, lon, ...this.paramsOpenWeather },
			});
			const resp = await instance.get();
			const { weather, main } = resp.data;

			return {
				desc: weather[0].description,
				min: main.temp_min,
				max: main.temp_max,
				temp: main.temp,
			};
		} catch (e) {
			console.error(e);
		}
	}

	addToHistory(place = '') {
		if (
			!this.history
				.map((place) => place.toLowerCase())
				.includes(place.toLowerCase())
		) {
			this.history.unshift(place);
		}
		this.saveDB();
	}

	saveDB() {
		this.checkDbExiat();
		const payLoad = {
			history: this.history,
		};
		fs.writeFileSync(this.file, JSON.stringify(payLoad));
	}

	readDb() {
		this.checkDbExiat();
		const info = fs.readFileSync(this.file, { encoding: 'utf-8' });
		const data = JSON.parse(info);
		this.history = data.history;
	}

	checkDbExiat() {
		const payLoad = {
			history: this.history ?? [],
		};
		if (!fs.existsSync(this.dir)) {
			fs.mkdirSync(this.dir);
		}
		if (!fs.existsSync(this.file)) {
			fs.writeFileSync(this.file, JSON.stringify(payLoad));
		}
	}
}

module.exports = Search;
