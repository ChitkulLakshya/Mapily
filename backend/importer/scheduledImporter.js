const cron = require('node-cron');
const { runFullImport } = require('./autoImporter');

// Schedule the import to run weekly on Monday at 2:00 AM
// Format: second minute hour dayOfMonth month dayOfWeek
// dayOfWeek: 0 = Sunday, 1 = Monday, etc.
cron.schedule('0 0 2 * * 1', () => {
  console.log('Running weekly food place import job...');
  runFullImport().catch(error => {
    console.error('Error in scheduled import job:', error);
  });
});

console.log('Scheduled importer started. Will run weekly on Monday at 2:00 AM.');

// For testing purposes, you can uncomment the line below to run immediately
// runFullImport().catch(error => console.error('Error in immediate import:', error));