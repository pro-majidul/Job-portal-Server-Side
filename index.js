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

    // job data apis
    app.get('/jobs', async (req, res) => {
      const email = req.query.email;
      let query = {};
      if (email) {
        query = { hr_email: email }
      }
      const cursor = JobCullection.find(query)
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
      // fokira away to find the data 
      for (const application of result) {
        const id = application.job_id;
        const query1 = { _id: new ObjectId(id) }
        const job = await JobCullection.findOne(query1);
        if (job) {
          application.title = job.title,
            application.category = job.category,
            application.company = job.company,
            application.company_logo = job.company_logo,
            application.location = job.location
        }

      }
      res.send(result)

    })

    app.post('/job-applications', async (req, res) => {
      const newApplicant = req.body;
      const result = await JobApplicationCollection.insertOne(newApplicant);
      const id = newApplicant.job_id;
      const query = { _id: new ObjectId(id) };
      const jobs = await JobCullection.findOne(query);
      let NewCount = 0;
      if (jobs.applicationCount) {
        NewCount = jobs.applicationCount + 1;
      } else {
        NewCount = 1;
      }
      const filter = { _id: new ObjectId(id) };
      const UpdateInfo = {
        $set: {
          applicationCount: NewCount
        }
      }
      const UpdateJob = await JobCullection.updateOne(filter, UpdateInfo)
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