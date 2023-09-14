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

  // Check if the URL follows the valid format using a regular expression
  const urlPattern = /^(http:\/\/(www\.)?|https:\/\/(www\.)?)([A-Za-z0-9-]+\.[A-Za-z]{2,})$/;
  if (!urlPattern.test(req.body.url)) {
    return res.status(400).json({error: 'invalid url'}); // Invalid URL format
  }

  dns.lookup(hostname, (err1, result) => {
    if(err1) return console.log({error: 'invalid url'});
  });

  var shortenUrl = await URL.countDocuments();
  shortenUrl = shortenUrl + 1;

  urlEntry = URL({oldUrl: url.href,newUrl: shortenUrl});

  urlEntry.save();
  res.json({original_url: url.href,short_url: shortenUrl});
});

// Your first API endpoint
app.get('/api/shorturl/:short_url', async function(req, res) {
  const shortUrl = req.params.short_url;
  urlEntry = await URL.findOne({newUrl: shortUrl});

  res.redirect(urlEntry.oldUrl);
});
