const express = require('express');
const morgan = require('morgan'); // morgan is useful to log records on the server terminal
const app = express();
const PORT = 8080;

// use ejs template
app.set("view engine", "ejs");

const urlDatabse = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
}

app.use(morgan('dev'));

// app.use((req, res, next) => { //middleware to parse, we can use the coolie-parser, or the body-parser, or whatever you want
//   console.log(res);
//   next();
// })

app.get('/', (req, res) => {
  res.send('Hello!');
});

app.get('/urls', (req, res) => {
  const templateVars = { urls: urlDatabse };
  res.render('urls_index', templateVars);
});

app.get('/hello', (req, res) => {
  res.send('<html><body><b>Hello!</b></body></html>');
})

app.get('/urls.json', (req, res) => {
  res.json(urlDatabse);
})

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