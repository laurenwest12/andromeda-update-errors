const axios = require('axios');
const { andromedaAuthorization } = require('./authorization.js');
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

const updateAndromeda = async (data) => {
  const errors = [];

  for (let i = 0; i < data.length; ++i) {
    if (i % 50 === 0) {
      await andromedaAuthorization();
    }

    const { idStyle, Season, Style, CorrectCost, CorrectPrice, CorrectMSRP } =
      data[i];
    console.log(Season, Style, CorrectPrice, CorrectCost, CorrectMSRP);
    try {
      const res = await axios.post(`${url}/bo/DevelopmentStyle/${idStyle}`, {
        Entity: {
          cost: CorrectCost,
          price: CorrectPrice,
          msrp: CorrectMSRP,
        },
      });

      !res?.data.IsSuccess &&
        errors.push({
          idStyle,
          Season,
          Style,
          err: res?.data.Result,
        });
    } catch (err) {
      errors.push({
        idStyle,
        Season,
        Style,
        err: err?.response?.data?.Message,
      });
    }
  }
  return errors;
};

module.exports = {
  getDevelopmentStylesById,
  getDevelopmentStyles,
  getDevelopmentStyleIds,
  getAndromedaDataByQuery,
  updateAndromeda,
};
