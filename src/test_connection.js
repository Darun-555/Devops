const { MongoClient, ServerApiVersion } = require('mongodb');

// REPLACE <db_password> with your actual password (no brackets)
// const uri = "mongodb+srv://user1:hello123@hospital.ik2b7h3.mongodb.net/?appName=Hospital";
const uri ="mongodb+srv://devopsUser:devopsUser12@cluster0.z2iaflf.mongodb.net/testdb?retryWrites=true&w=majority&appName=Cluster0";
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
    await client.db("testdb").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    await client.close();
  }
}
run().catch(console.dir);