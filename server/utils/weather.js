require('dotenv').config();
const axios = require('axios');

const { OWM_URL, OWM_API_KEY } = process.env;

function formatQuery(options) {
  const { zip, country, city, units} = options;
  return "?" + Object.keys(options).reduce((prev, curr) => {
    prev += curr + "=" + options[curr] + "&";
    return prev
  }, "") + `appid=${OWM_API_KEY}`;
}

function formatRequest(options) {
  const queryParams = formatQuery(options);
  return OWM_URL + queryParams
}

function requestWeather(options) {
  return new Promise((resolve, reject) => {
    axios.get(formatRequest(options))
    .then(response => resolve(response.data))
    .catch((err) => {
      reject(err);
    })
  })
}

module.exports = requestWeather;