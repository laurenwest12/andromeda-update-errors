const express = require('express');
const app = express();

const { type } = require('./config.js');
const { andromedaAuthorization } = require('./authorization.js');
const { getStartTime, submitStartTime } = require('./functions/runTimes.js');
const { sendErrorReport } = require('./functions/errorReporting.js');
const {
  connectDb,
  getSQLServerDataByQuery,
  submitAllQueries,
  executeProcedure,
  submitQuery,
  getLastRunTime,
} = require('./sql');
const {
  getDevelopmentStyleIds,
  getDevelopmentStylesById,
} = require('./andromeda.js');
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

const getIdsNotSubmitted = async () => {
  const andromedaIds = await getDevelopmentStyleIds();
  const submittedIdsObjArr = await getSQLServerDataByQuery(
    `SELECT DISTINCT idStyle FROM StylePriceImport`
  );
  const submittedIds = submittedIdsObjArr.map(({ idStyle }) => idStyle);
  const notSubmittedIds = andromedaIds.filter(
    (id) => !submittedIds.includes(id)
  );
  const styles = await getDevelopmentStylesById(notSubmittedIds);
  return styles;
};

const server = app.listen(6000, async () => {
  console.log('App is listening...');
  let errors = [];

  try {
    await andromedaAuthorization();
    await connectDb();
    const lastRunTime = await getLastRunTime('StylePriceImportArchive');
    // await submitQuery('TRUNCATE TABLE StylePriceImport');

    // const notSubmittedStyles = await getIdsNotSubmitted();
    // const submitErrors = await submitStylePrices(notSubmittedStyles);
    // errors.push(submitErrors);
    // await executeProcedure('StylePriceImportfromAndromeda');
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
