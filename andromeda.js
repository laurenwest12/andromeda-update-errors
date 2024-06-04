const axios = require('axios');
const { andromedaAuthorization } = require('./authorization.js');
const { url } = require('./config.js');

const updateAndromeda = async (data) => {
  const errors = [];

  for (let i = 0; i < data.length; ++i) {
    // Reauthorize every 100 requests
    if (i % 100 === 0) {
      await andromedaAuthorization();
    }

    // Extract the necessary data from the object
    const { idStyle, Season, Style, CorrectCost, CorrectPrice, CorrectMSRP } =
      data[i];
    console.log(Season, Style, CorrectPrice, CorrectCost, CorrectMSRP);
    try {
      // Update the development style with the corrected prices
      const res = await axios.post(`${url}/bo/DevelopmentStyle/${idStyle}`, {
        Entity: {
          cost: CorrectCost,
          price: CorrectPrice,
          msrp: CorrectMSRP,
        },
      });

      // If the request is not successful, push the error to the errors array
      !res?.data.IsSuccess &&
        errors.push({
          idStyle,
          Season,
          Style,
          err: res?.data.Result,
        });
    } catch (err) {
      // Add any unexpected errors to the errors array
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

const getAndromedaDataByQuery = async (query, lastRunTime) => {
  const res = await axios.post(`${url}/search/query/${query}`, {
    getafterdate: lastRunTime,
  });
  return res.data;
};

module.exports = {
  getAndromedaDataByQuery,
  updateAndromeda,
};
