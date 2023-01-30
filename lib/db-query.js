const { Client } = require('pg');
require('dotenv').config();

const logQuery = (statement, parameters) => {
  const timeStamp = new Date();
  const formattedTimeStamp = timeStamp.toString().substring(4, 24);
  console.log(formattedTimeStamp, statement, parameters);
};

module.exports = {
  async dbQuery(statement, ...parameters) {
    const client = new Client({
      // database: 'connections'
      // supabase: https://app.supabase.com/projects#
      user: process.env.PGUSER,
      password: process.env.PGPASSWORD,
      host: process.env.PGHOST,
      database: process.env.PGDATABASE,
      port: process.env.PGPORT,
    });

    await client.connect();
    logQuery(statement, parameters);
    const result = await client.query(statement, parameters);
    await client.end();

    return result;
  },
};
