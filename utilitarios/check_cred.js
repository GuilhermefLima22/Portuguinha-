const { Container } = require('typedi');
const { CredentialsRepository } = require('/usr/local/lib/node_modules/n8n/dist/databases/repositories/credentials.repository');
const { Cipher } = require('/usr/local/lib/node_modules/n8n/dist/cipher');

async function test() {
  const sqlite3 = require('/usr/local/lib/node_modules/n8n/node_modules/sqlite3');
  const db = new sqlite3.Database('/home/node/.n8n/database.sqlite');
  db.get("SELECT data FROM credentials_entity WHERE id = 'UWnoYyDbXUokqOCQ'", async (err, row) => {
    console.log("Cred data raw:", row ? row.data.slice(0, 100) : 'none');
  });
}
test();
