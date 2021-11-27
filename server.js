require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dns = require('dns');
const app = express();

var mongoose = require("mongoose");
const Schema = mongoose.Schema;

mongoose.connect(
  process.env['MONGO_URI'],
  {
      useNewUrlParser: true,
      useUnifiedTopology: true
  }
);

const urlPairSchema = new Schema({
  origionalUrl : {type: String, required:true},
  shortUrl: {type: Number}
})

let UrlPair = mongoose.model("UrlPair", urlPairSchema);

var bodyParser = require('body-parser');



// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

//setup to use post request
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

function getNthPosition(myString, substring, n){
  var currentN = 1;
  for (var i=0; i < myString.length; i++){
    if(myString.slice(i, i + substring.length) === substring){
      if(currentN === n)return i;
      currentN ++;
    }
  }
  return 0;
}

app.post('/api/shorturl', async (req, res) =>{
  const max = 5000;
  console.log(req.body.url);
  
  //verify url using dns core
  var foundhost = false;
  dns.lookup(req.body.url,(err, address, family)=>{
    if(err){
      res.json({error: 'invalid url'});
      return
    }
  });

  var shortUrls = await UrlPair.find({},{shortUrl:1, _id:0});

  const newShortUrl = Math.floor(Math.random() * max);

  while(newShortUrl in shortUrls){
    newShortUrl = Math.floor(Math.random() * max);
  }

  UrlPair.create({origionalUrl:req.body.url, shortUrl: newShortUrl})
  .then((newUrlPair) => {
    res.json({
      origional_url : newUrlPair.origionalUrl,
      short_url : newUrlPair.shortUrl
      });
  });
  
  
});

app.get('/api/shorturl/:shortUrl', async (req, res)=>{
  const short = parseInt(req.params.shortUrl);
  const pair = await UrlPair.findOne({shortUrl:short});
  if(!pair){
    //error
    res.send("error finding short");
  }

  res.redirect(301,pair.origionalUrl);
});


app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
