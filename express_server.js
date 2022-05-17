const express = require('express');
const morgan = require('morgan'); // morgan is useful to log records on the server terminal
const bodyParser = require("body-parser");

const app = express();
const PORT = 8080;

// use ejs template
app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended: true}));

const urlDatabse = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
}

// use of middleware
app.use(morgan('dev'));

app.get('/', (req, res) => {
  res.send('Hello!');
});

app.get('/urls', (req, res) => {
  const templateVars = { urls: urlDatabse };
  res.render('urls_index', templateVars);
});


app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get('/urls/:shortURL', (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabse[req.params.shortURL] };
  res.render('urls_show', templateVars);
})

app.get('/hello', (req, res) => {
  res.send('<html><body><b>Hello!</b></body></html>');
})

app.get('/urls.json', (req, res) => {
  res.json(urlDatabse);
})

app.post('/urls', (req, res) => {
  console.log(req.body);
  res.send("Ok");
});


// variable experiments
app.get('/set', (req, res) => {
  const a = 1;
  res.send(`a = ${a}`);
});

app.get('/fetch', (req, res) => {
  res.send(`a = ${a}`);
  
})

// a catch all app.get and it has to be at the end because it will catch all the route user enters, the statusCode will always be 200, instead of 404, unless you also put in res.statusCode(404) or res.statusCode(404) alone inside this app.get callback
app.get('*', (req, res) => {
  // res.send(`This is not the page you are looking for`); ==> this will result in a 200 status code
  res.statusCode = 404;
  return res.send('Page not found');
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});