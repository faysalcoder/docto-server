const express = require('express')
const app = express()
const cors = require('cors');
const { MongoClient } = require('mongodb')
require('dotenv').config();
const ObjectId = require('mongodb').ObjectId;
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@docto.k3xrf.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db('docto');
        const doctorsCollection = database.collection('doctors');
        const appointmentsCollection = database.collection('appointments');
        const usersCollection = database.collection('users');
        const reviewsCollection = database.collection('reviews');

        // doctor insert
        app.post('/doctors', async (req, res) => {
            const doctor = req.body
            const result = await doctorsCollection.insertOne(doctor);

            res.json(result)
        })
        //appointment
        app.post('/placeappointment', async (req, res) => {
            const appointment = req.body
            const result = await appointmentsCollection.insertOne(appointment);

            res.json(result)
        })


        app.get('/doctors', async (req, res) => {
            const cursor = doctorsCollection.find({});
            const page = req.query.page;
            const size = parseInt(req.query.size);
            let doctors;
            const count = await cursor.count();

            if (page) {
                doctors = await cursor.skip(page * size).limit(size).toArray();
            }
            else {
                doctors = await cursor.toArray();
            }

            res.send({
                count,
                doctors
            })
        });
        //Reviews
        app.post('/reviews', async (req, res) => {
            const review = req.body
            const result = await reviewsCollection.insertOne(review);

            res.json(result)
        })
        //Get doctors Data
        app.get('/doctors', async (req, res) => {
            const cursor = doctorsCollection.find({});
            const result = await cursor.toArray();
            res.send(result)
        })
        // Get appointments Data
        app.get('/appointments', async (req, res) => {
            const cursor = appointmentsCollection.find({});
            const result = await cursor.toArray();
            res.send(result)
        })
        //Get Review Data
        app.get('/reviews', async (req, res) => {
            const cursor = reviewsCollection.find({});
            const result = await cursor.toArray();
            res.send(result)
        })
        //Get Review Data
        app.get('/users', async (req, res) => {
            const cursor = usersCollection.find({});
            const result = await cursor.toArray();
            res.send(result)
        })
        // Find Place appointment Data
        app.get('/placeappointment/:id', async (req, res) => {
            const id = req.params.id

            const query = { _id: ObjectId(id) }
            const result = await doctorsCollection.findOne(query)
            res.json(result)
        })
        //Admin Identify

        app.get('/users/:email', async (req, res) => {
            const email = req.params.email
            const query = { email: email }
            const user = await usersCollection.findOne(query)
            let isAdmin = false
            if (user?.role === 'Admin') {
                isAdmin = true
            }
            console.log(isAdmin)
            res.json({ admin: isAdmin })
        })

        app.post('/users', async (req, res) => {
            const user = req.body
            const result = await usersCollection.insertOne(user);

            res.json(result)
        })

        app.put('/users', async (req, res) => {
            const user = req.body

            const filter = { email: user.email }
            const option = { upsert: true }
            const updateDoc = {
                $set: {
                    name: user.name,
                    email: user.email
                }
            }
            const result = await usersCollection.updateOne(filter, updateDoc, option)

            res.json(result)
        })

        app.put('/users/admin', async (req, res) => {
            const user = req.body

            const filter = { email: user.email }

            const updateDoc = {
                $set: {
                    role: 'Admin'
                }
            }
            const result = await usersCollection.updateOne(filter, updateDoc)
            res.json(result)
        })
        app.put('/doctors/review', async (req, res) => {
            const data = req.body
            console.log(data)
            const filter = { name: data.doctor }

            const updateDoc = {
                $set: {
                    rating: data.rate
                }
            }
            const result = await doctorsCollection.updateOne(filter, updateDoc)
            res.json(result)
        })
        app.put('/appointments/confirm', async (req, res) => {

            const { appointmentId } = req.body

            const filter = { _id: ObjectId(appointmentId) }

            const updateDoc = {
                $set: {
                    status: 'Shipped'
                }
            }
            const result = await appointmentsCollection.updateOne(filter, updateDoc)
            res.json(result)
        })

        app.delete('/doctors/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await doctorsCollection.deleteOne(query)
            res.json(result)
        })
        app.delete('/appointments/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await appointmentsCollection.deleteOne(query)
            res.json(result)
        })

    } finally {
        //   await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Server Running')
})

app.listen(port, () => {
    console.log(`Listening ${port}`)
})