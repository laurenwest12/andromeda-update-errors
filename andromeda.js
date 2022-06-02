const axios = require('axios');
const { url } = require('./config.js');

const getDevelopmentStyles = async () => {
  const res = await axios.get(`${url}/bo/DevelopmentStyle`);
  return res.data;
};

module.exports = {
  getDevelopmentStyles,
};
