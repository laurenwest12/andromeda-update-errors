const axios = require('axios');
const { url } = require('./config.js');

const getDevelopmentStylesById = async (arr) => {
  const styles = [];

  for (let i = 0; i < arr.length; ++i) {
    const id = arr[i];
    const res = await axios.get(`${url}/bo/DevelopmentStyle/${id}`);
    styles.push(res.data.Entity);
  }

  return styles;
};

const getDevelopmentStyles = async () => {
  const res = await axios.get(`${url}/bo/DevelopmentStyle`);
  return res.data;
};

const getDevelopmentStyleIds = async () => {
  const res = await axios.get(`${url}/bo/DevelopmentStyle`);
  return res.data.map(({ id_developmentstyle }) => id_developmentstyle);
};

const getAndromedaDataByQuery = async (query, lastRunTime) => {
  const res = await axios.post(`${url}/search/query/${query}`, {
    getafterdate: lastRunTime,
  });
  return res.data;
};

module.exports = {
  getDevelopmentStylesById,
  getDevelopmentStyles,
  getDevelopmentStyleIds,
  getAndromedaDataByQuery,
};
