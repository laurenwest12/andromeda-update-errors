const axios = require('axios');
const { url } = require('./config.js');
const { mapStylesToSQLFormat } = require('./mappings/price');

const getDevelopmentStyles = async () => {
  const { data } = await axios.get(`${url}/bo/DevelopmentStyle/18236`);
  return [data];
};

module.exports = {
  getDevelopmentStyles,
};
