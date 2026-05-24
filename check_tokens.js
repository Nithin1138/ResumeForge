const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL
});

async function main() {
  await client.connect();
  const res = await client.query('SELECT * FROM "VerificationToken"');
  console.log("Tokens:", res.rows);
  const users = await client.query('SELECT id, email, "emailVerified" FROM "User"');
  console.log("Users:", users.rows);
  await client.end();
}
main();
