const { MongoClient, ServerApiVersion } = require('mongodb');

// REPLACE <db_password> with your actual password (no brackets)
// const uri = "mongodb+srv://user1:hello123@hospital.ik2b7h3.mongodb.net/?appName=Hospital";
const uri ="mongodb://user1:hello123@ac-ttcpdut-shard-00-00.ik2b7h3.mongodb.net:27017,ac-ttcpdut-shard-00-01.ik2b7h3.mongodb.net:27017,ac-ttcpdut-shard-00-02.ik2b7h3.mongodb.net:27017/<DB_NAME>?authSource=admin&replicaSet=atlas-7p72fv-shard-0&tls=true&retryWrites=true&w=majority"
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    await client.close();
  }
}
run().catch(console.dir);