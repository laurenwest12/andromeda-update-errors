const express = require('express');
const app = express();

const { type } = require('./config.js');
const { andromedaAuthorization } = require('./authorization.js');
const { getStartTime, submitStartTime } = require('./functions/runTimes.js');
const { sendErrorReport } = require('./functions/errorReporting.js');
const { connectDb, submitAllQueries } = require('./sql');
const { getDevelopmentStyles } = require('./andromeda.js');
const { mapStylesToSQLFormat } = require('./mappings/price.js');

const server = app.listen(6000, async () => {
  console.log('App is listening...');
  const errors = [];

  try {
    await andromedaAuthorization();
    await connectDb();
    const andromedaData = await getDevelopmentStyles();
    const sqlFormat = await mapStylesToSQLFormat(andromedaData);
    const insertErrors = await submitAllQueries(sqlFormat, 'StylePriceImport');
    console.log(insertErrors);
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
