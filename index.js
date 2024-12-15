const express = require('express')
const cors = require('cors')
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;
app.use(cors())
app.use(express.json())




app.get('/', (req, res) => {
  res.send('Jobs portal server is running ')
})

const uri = `mongodb+srv://${process.env.USER_ID}:${process.env.USER_PASS}@cluster0.xihi8.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {

    const JobCullection = client.db('jobs-portal').collection('jobs')
    const JobApplicationCollection = client.db('jobs-portal').collection('job-applications')

    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });


    app.get('/jobs', async (req, res) => {
      const cursor = JobCullection.find()
      const result = await cursor.toArray();
      res.send(result)
    })
    app.get('/jobs/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await JobCullection.findOne(query);
      res.send(result)
    })

    app.post('/jobs', async (req, res) => {
      const newJobs = req.body;
      const result = await JobCullection.insertOne(newJobs)
      res.send(result)
    })

    //  job application collection 

    // get some data 
    app.get('/job-application', async (req, res) => {
      const email = req.query.email;
      const query = { applicant_email: email };
      const result = await JobApplicationCollection.find(query).toArray();
      res.send(result)
    })

    app.post('/job-applications', async (req, res) => {
      const newApplicant = req.body;
      const result = await JobApplicationCollection.insertOne(newApplicant);
      res.send(result)
    })

    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);






app.listen(port, () => {
  console.log(`jobs Portal running on ${port}`);
})