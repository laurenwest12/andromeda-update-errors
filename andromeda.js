const axios = require('axios');
const { url } = require('./config.js');

const getDevelopmentStyles = async () => {
  const res = await axios.get(`${url}/bo/DevelopmentStyle`);
  return res.data;
};

const getDevelopmentStyleIds = async () => {
  const res = await axios.get(`${url}/bo/DevelopmentStyle`);
  return res.data
    .slice(0, 15)
    .map(({ id_developmentstyle }) => id_developmentstyle);
};

module.exports = {
  getDevelopmentStyleIds,
};
