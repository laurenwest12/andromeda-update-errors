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
} = require('./sql');
const { getDevelopmentStyleIds } = require('./andromeda.js');
const { mapStylesToSQLFormat } = require('./mappings/price.js');

const getIdsNotSubmitted = async () => {
  const andromedaIds = await getDevelopmentStyleIds();
  const submittedIdsObjArr = await getSQLServerDataByQuery(
    `SELECT DISTINCT idStyle FROM StylePriceImport`
  );
  const submittedIds = submittedIdsObjArr.map(({ idStyle }) => idStyle);
  return andromedaIds.filter((id) => !submittedIds.includes(id));
};

const server = app.listen(6000, async () => {
  console.log('App is listening...');
  const errors = [];

  try {
    await andromedaAuthorization();
    await connectDb();
    const notSubmittedIds = await getIdsNotSubmitted();
    console.log(notSubmittedIds);

    // const insertErrors = await submitAllQueries(
    //   mapStylesToSQLFormat,
    //   data,
    //   'StylePriceImport'
    // );
    // insertErrors.length && errors.push(insertErrors);
  } catch (err) {
    errors.push({
      type,
      err: err?.message,
    });
  }

  if (errors.flat().length) {
    await sendErrorReport(errors.flat(), type);
  }

  process.kill(process.pid, 'SIGTERM');
});

process.on('SIGTERM', () => {
  server.close(() => {
    console.log('Process terminated');
  });
});
