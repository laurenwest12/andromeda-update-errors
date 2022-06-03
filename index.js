const express = require('express');
const app = express();

const { type } = require('./config.js');
const { andromedaAuthorization } = require('./authorization.js');
const { sendErrorReport } = require('./functions/errorReporting.js');
const {
  connectDb,
  submitAllQueries,
  executeProcedure,
  submitQuery,
  getLastRunTime,
} = require('./sql');
const { getAndromedaDataByQuery } = require('./andromeda.js');
const { mapStylesToSQLFormat } = require('./mappings/price.js');

const submitStylePrices = async (data) => {
  const errors = [];
  const insertErrors = await submitAllQueries(
    mapStylesToSQLFormat,
    data,
    'StylePriceImport'
  );
  insertErrors.length && errors.push(insertErrors);
  return errors.flat();
};

const server = app.listen(6000, async () => {
  console.log('App is listening...');
  let errors = [];

  try {
    await andromedaAuthorization();
    await connectDb();
    const lastRunTime = await getLastRunTime('StylePriceImportArchive');
    const data = await getAndromedaDataByQuery(
      'ECHO-StyleCostUpdates',
      '2022-06-02 18:04:20.000'
    );

    await submitQuery('TRUNCATE TABLE StylePriceImport');
    const submitErrors = await submitStylePrices(data);
    errors.push(submitErrors);
    await executeProcedure('StylePriceImportfromAndromeda');
  } catch (err) {
    errors.push({
      type,
      err: err?.message,
    });
  }

  if (errors.flat().length) {
    errors = errors.flat();
    await sendErrorReport(errors.flat(), type);
  }

  process.kill(process.pid, 'SIGTERM');
});

process.on('SIGTERM', () => {
  server.close(() => {
    console.log('Process terminated');
  });
});
