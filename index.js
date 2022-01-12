import express from 'express';
const app = express();

import { type } from './config.js';
import { andromedaAuthorization } from './authorization.js';
import { getStartTime, submitStartTime } from './functions/runTimes.js';
import { sendErrorReport } from './functions/errorReporting.js';


const server = app.listen(6000, async () => {
  console.log("App is listening...");
  let authorizationResult = await andromedaAuthorization();

  if (authorizationResult.indexOf("Error") === -1) {
    console.log("Authorization complete");
    const { lastRunTime, nextRunTime } = await getStartTime(type);

    let allErrors = [{
      err: 'Test',
      lastId: 1
    }];

    allErrors = allErrors.flat();

    if (allErrors.length) {
      await sendErrorReport(allErrors, type)
    } 

    await submitStartTime(type, nextRunTime)
  }

  process.kill(process.pid, "SIGTERM");
});

process.on("SIGTERM", () => {
  server.close(() => {
    console.log("Process terminated");
  });
});
