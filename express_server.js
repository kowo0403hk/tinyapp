const express = require('express');
const morgan = require('morgan'); 
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

// redirect from the shortener as long as the server is online
app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabse[req.params.shortURL];

  if (!longURL.includes('http://')) {
    res.redirect(`http://${longURL}`);
  } else {
    res.redirect(longURL);
  }
})

// http://localhost:8080/u/http//www.facebook.com

app.get('/urls/:shortURL', (req, res) => {
  // the route parameter will be based on user input
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabse[req.params.shortURL] };
  res.render('urls_show', templateVars);
})

app.post('/urls', (req, res) => {
  // after receiveing the longURL input from the user, run the redirect function
  res.redirect(`/urls/${randomString(req.body)}`);
});

// a catch all app.get and it has to be at the end because it will catch all the route user enters, the statusCode will always be 200, instead of 404, unless you also put in res.statusCode(404) or res.statusCode(404) alone inside this app.get callback
app.get('*', (req, res) => {
  // res.send(`This is not the page you are looking for`); ==> this will result in a 200 status code
  res.statusCode = 404;
  return res.send('Page not found');
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});

function randomString(obj) {
  let shortURL = Math.floor((1 + Math.random()) * 0x100000).toString(16);
  urlDatabse[shortURL] = obj.longURL;
  return shortURL;
}