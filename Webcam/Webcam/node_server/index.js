const express = require('express');
const fs = require('fs');
const exphbs = require('express-handlebars');
const path = require('path');
const handlebars = require('handlebars');
const { MongoClient } = require("mongodb");
const Parking = require('./models/parking');

const uri = 'mongodb+srv://sparking:Az123456@dbs.bgpecdq.mongodb.net/test?retryWrites=true&w=majority';

const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const app = express();
const hbs = exphbs.create();

// Set up Handlebars as the view engine
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

client.connect()
    .then(() => {
        console.log('Connected to MongoDB');

        app.get('/', async (req, res) => {
            const templatePath = path.join(__dirname, 'template.hbs');
            try {
                const database = client.db('ATH_UET');
                const RFCollection = database.collection('RFid');

                const RFs = await RFCollection.find({})
                    .sort({ lastModified: 1 }) // 1 for ascending order, -1 for descending
                    .limit(10)
                    .toArray();
                console.log(RFs)
                fs.readFile(templatePath, 'utf-8', (err, templateContent) => {
                    if (err) {
                        res.status(500).send('Error loading the template.');
                    } else {
                        const data = {
                            videos: [
                                { id: 1, src: '/video/test1.mp4' },
                                { id: 2, src: '/video/test2.mp4' },
                                { id: 3, src: '/video/test1.mp4' },
                                { id: 4, src: 'https://www.example.com/path-to-your-video.mp4' }
                            ],
                            rfs: RFs
                        };
                        const template = handlebars.compile(templateContent);
                        const renderedHtml = template(data);

                        res.status(200).send(renderedHtml);
                    }
                });
            } catch (error) {
                console.error('Error:', error);
                res.status(500).send('Internal Server Error');
            }
        });

        const PORT = 3000;
        app.listen(PORT, () => {
            console.log(`Server is running at http://localhost:${PORT}`);
        });
    })
    .catch(err => {
        console.error('Error connecting to MongoDB:', err);
    });

