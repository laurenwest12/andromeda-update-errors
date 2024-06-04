# Andromda Update Errors

## Description

Find any styles in Andromeda whose prices on the development style do not match the prices on the LINE PLAN cost sheet.

## Schedule

- Every 30 minutes on :10 and :40.

## How To Run

There are two ways to run the program.

1. In the task scheduler in NGCANC, right click 'Andromeda Updates Errors' and click "Run".
2. Navigate to the location of the program in a terminal window and type "npm run start".

## How It Works

### Steps

1. Run andromedaAuthorization to connect to the Andromeda API.
2. Run the connectDb function to connect to SQL Server.
3. Find the last time the program ran by finding the last time a style was mofified in [Andromeda-DownFrom].[dbo].[StylePriceImportArchive].
4. Query the Andromeda API with ECHO-StyleCostUpdates query, which finds any costs that have been modified on a development style since the last time passed into the function.
5. Add any styles retrieved above to [Andromeda-DownFrom].[dbo].[StylePriceImport] and run the process to add to the archive table.
6. Run the [Andromeda-DownFrom].[dbo].[PopulateStylePriceCorrections] stored procedure, which finds where the cost from the [StylePriceImportArchive] table does not match what is in the most recent LINE PLAN cost sheet (this looks at the total cost, wholesale, and retail). This then adds them to the [Andromeda-DownFrom].[dbo].[StylePriceCorrections].
7. Get all of these price corrections calculated above, loop through the styles, and update the development style to have the same prices as the cost sheets.
8. Return any errors and send an error report email.
