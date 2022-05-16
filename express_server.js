const express = require('express');
const app = express();
const PORT = 8080;

const urlDatabse = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
}

app.get('/', (req, res) => {
  res.send('Hello!');
});

app.get('/urls', (req, res) => {
  res.send('You are at the url page');
})

app.get('/hello', (req, res) => {
  res.send('<html><body><b>Hello!</b></body></html>');
})

app.get('/urls.json', (req, res) => {
  res.json(urlDatabse);
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});