// process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;
const { andromedaAuthorization } = require('./authorization.js');
const { sendErrorEmail } = require('./functions/errorReporting.js');
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

const getAndInsertStylePrices = async () => {
  // Find the last run time for the StylePriceImportArchive
  const lastRunTime = await getLastRunTime('StylePriceImportArchive');

  // Get the data from Andromeda by connecting to the ECHO-StyleCostUpdates query
  const data = await getAndromedaDataByQuery(
    'ECHO-StyleCostUpdates',
    lastRunTime
  );

  // Truncate the StylePriceImport table
  await submitQuery('TRUNCATE TABLE StylePriceImport');
  const submitErrors = await insertStylePrices(data);
  // Execute the StylePriceImportfromAndromeda procedure, which adds the data from the StylePriceImport table to the StylePriceImportArchive table
  await executeProcedure('StylePriceImportfromAndromeda');
  return submitErrors;
};

const insertStylePrices = async (data) => {
  const errors = [];
  const styles = data.filter(
    ({ id_developmentstyle }) => id_developmentstyle !== 21808
  );
  // Insert the data into the StylePriceImport table
  const insertErrors = await submitAllQueries(
    mapStylesToSQLFormat,
    styles,
    'StylePriceImport'
  );
  // Add the errors to the errors array
  insertErrors.length && errors.push(insertErrors);
  // Return the errors
  return errors.flat();
};

const findMismatchingPrices = async () => {
  // Run PopulateStylePriceCorrections procedure which creates a table that contains the styles that have mismatching prices between the development style and the cost sheet
  await executeProcedure('PopulateStylePriceCorrections');
  // Get all price mismatches from the StylePriceCorrections table populated above
  const data = await getSQLServerData('StylePriceCorrections');
  // Update the Andromeda development styles with the corrected prices
  const errors = await updateAndromeda(data);
  return errors;
};

const main = async () => {
  console.log('Andromeda update errors');
  let errors = [];

  try {
    // Connect to Andromeda API
    await andromedaAuthorization();
    // Connect to SQL Server
    await connectDb();
    console.log('Connected');

    // Get any styles whose costs have been updated in Andromeda since the last run and add them to the StylePriceImportArchive table
    const submitErrors = await getAndInsertStylePrices();
    console.log('Styles prices complete');
    errors.push(submitErrors);

    // Find any styles that have mismatching prices between the development style and the cost sheet and update the development style with the corrected prices in Andromeda
    const updateErrors = await findMismatchingPrices();
    console.log('Mismatch prices complete');

    // Add any errors to the errors array
    errors.push(updateErrors);
  } catch (err) {
    errors.push({
      type,
      err: err?.message,
    });
    await sendErrorEmail(errors.flat());
  }

  // If there are any errors, send an error report
  if (errors.flat().length) {
    errors = errors.flat();
    await sendErrorEmail(errors.flat());
  }
};

main()

// Register an unhandled exception handler
process.on('uncaughtException', async (err) => {
  // Exit the application with an error code
  process.exit(1);
});

// Register an unhandled exception handler
process.on('unhandledRejection', async (err) => {
  // Exit the application with an error code
  process.exit(1);
});
