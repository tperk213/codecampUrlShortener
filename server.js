require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dns = require('dns');
const app = express();
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

app.post('/api/:shorturl?', (req, res) =>{
  console.log(req.body.url);
  
  //verify url using dns core
  var foundhost = false;
  dns.lookup(req.body.url,(err, address, family)=>{
    if(!err){
      console.log("found host");
      foundhost = true;
    }
  });
  //if not valid return with error
  if(!foundhost){
    res.json({error: 'invalid url'});
    return
  }
  
  
  //get origion url
  var position = getNthPosition(req.body.url, '/', 3);
  console.log("position of the 3rd / is : ", position);
  var origional  = req.body.url.slice(0, position);
  
  //get short url after /api/
  position = getNthPosition(req.body.url, '/', 4);
  var shortUrl = req.body.url.slice(position+1);

  res.json({
    origional_url:origional,
    short_url:shortUrl
  });
});


app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
