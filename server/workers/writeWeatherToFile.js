const fs = require('fs');
const requestWeather = require('../utils/weather');

function writeDataToFile(weather) {
  fs.readFile(`./${weather.name.toLowerCase()}-weather.json`, 'utf-8', (err, content) => {
    let json = {};
    if (content !== undefined) {
      json = JSON.parse(content);
    } else {
      json = {
        data: [],
        labels: [],
      };
    }
    json.data.push(weather.main.temp);
    json.labels.push(Date.now());
    json.lastModified = Date.now();
    fs.writeFile(`./${weather.name.toLowerCase()}-weather.json`, JSON.stringify(json), (err) => {
      console.log(err);
    });
  });
}

setTimeout(function tick() {
  requestWeather({
    zip: 95618,
    country: 'US',
    city: 'DAVIS',
    units: 'metric',
  }).then((weather) => {
    console.log(weather.main.temp);
    writeDataToFile(weather);
  }).catch((err) => {
    console.log(err);
  });
  setTimeout(tick, 60 * 1000);
}, 100);
