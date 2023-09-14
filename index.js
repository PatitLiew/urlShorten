require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var bodyParser = require("body-parser");
const dns = require('dns');
const urlParser = require('url');


// Basic Configuration
const port = process.env.PORT || 3000;

mongoose.connect("mongodb+srv://MongoDB_Backend:voGoFuB_9122110@cluster0.q5x6eti.mongodb.net/", { useNewUrlParser: true, useUnifiedTopology: true });

const urlSchema = new Schema({
  oldUrl: String,
  newUrl: Number
});

const URL = mongoose.model("URL", urlSchema);

app.use(bodyParser.urlencoded({extended: false}));

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

app.post('/api/shorturl', async function(req, res) {
  const url = urlParser.parse(req.body.url);
  const hostname = String(url.hostname);

  dns.lookup(hostname, (err1, address) => {
    if(err1) return res.json({error: 'invalid url'});
    console.log(address);
  });

  const existingUrlEntry = await URL.findOne({ oldUrl: url.href });

  if (existingUrlEntry) {
      // If the URL already exists, return the existing short URL
    res.json({ original_url: url.href, short_url: existingUrlEntry.newUrl });
  } else {
  // If the URL is not in the database, generate a new short URL
    const shortenUrl = await URL.countDocuments() + 1;
  

    // Create a new document and save it to the database
    const urlEntry = new URL({ oldUrl: url.href, newUrl: shortenUrl });
    await urlEntry.save();

    res.json({original_url: url.href,short_url: shortenUrl});
  };
});

// Your first API endpoint
app.get('/api/shorturl/:short_url', async function(req, res) {
  const shortUrl = req.params.short_url;
  urlEntry = await URL.findOne({newUrl: shortUrl});

  res.redirect(urlEntry.oldUrl);
});
