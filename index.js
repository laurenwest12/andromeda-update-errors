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
  getSQLServerData,
} = require('./sql');
const { getAndromedaDataByQuery, updateAndromeda } = require('./andromeda.js');
const { mapStylesToSQLFormat } = require('./mappings/price.js');

const insertStylePrices = async (data) => {
  const errors = [];
  const insertErrors = await submitAllQueries(
    mapStylesToSQLFormat,
    data,
    'StylePriceImport'
  );
  insertErrors.length && errors.push(insertErrors);
  return errors.flat();
};

const getAndInsertStylePrices = async () => {
  const lastRunTime = await getLastRunTime('StylePriceImportArchive');
  const data = await getAndromedaDataByQuery(
    'ECHO-StyleCostUpdates',
    lastRunTime
  );

  await submitQuery('TRUNCATE TABLE StylePriceImport');
  const submitErrors = await insertStylePrices(data);
  await executeProcedure('StylePriceImportfromAndromeda');
  return submitErrors;
};

const findMismatchingPrices = async () => {
  await executeProcedure('PopulateStylePriceCorrections');
  const data = await getSQLServerData('StylePriceCorrections');
  const errors = await updateAndromeda(data);
  return errors;
};

const server = app.listen(6000, async () => {
  console.log('App is listening...');
  let errors = [];

  try {
    await andromedaAuthorization();
    await connectDb();
    const submitErrors = await getAndInsertStylePrices();
    errors.push(submitErrors);

    const updateErrors = await findMismatchingPrices();
    errors.push(updateErrors);
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
