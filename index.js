const express = require("express");
const app = express();

const { type } = require("./config");
const { andromedaAuthorization } = require("./authorization");
const { getStartTime } = require("./functions/getStartTime");
const { getXlxs, sendErrorReport } = require("./functions/errorReporting");

const server = app.listen(6000, async () => {
  console.log("App is listening...");
  let authorizationResult = await andromedaAuthorization();

  if (authorizationResult.indexOf("Error") === -1) {
    console.log("Authorization complete");
    const lastRunTime = await getStartTime(type);

    let allErrors = [];

    allErrors = allErrors.flat();

    if (allErrors.length) {
      getXlxs(allErrors);
      await sendErrorReport(type);
    }
  }

  process.kill(process.pid, "SIGTERM");
});

process.on("SIGTERM", () => {
  server.close(() => {
    console.log("Process terminated");
  });
});
