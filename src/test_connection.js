const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGO_URI;

if (!uri) {
  throw new Error('MONGO_URI is missing. Add it to .env before testing connection.');
}

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true
  }
});

async function run() {
  try {
    await client.connect();
    await client.db().command({ ping: 1 });
    console.log('MongoDB ping successful');
  } finally {
    await client.close();
  }
}

run().catch((error) => {
  console.error('MongoDB ping failed:', error.message);
  process.exit(1);
});
