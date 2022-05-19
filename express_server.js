const express = require('express');
const morgan = require('morgan'); 
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

const app = express();
const PORT = 8080;

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
}

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  },
  "test": {
    id: "test", 
    email: "test@test.com", 
    password: "1234"
  }
}

// use of middleware
app.use(morgan('dev'));

////////////////////////////////////////////////////////////////
// GET method
////////////////////////////////////////////////////////////////

//login page
app.get('/login', (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]]
  };
  res.render('login', templateVars);
});

//home page
app.get('/urls', (req, res) => {
  console.log(urlDatabase, '\n', users);
  const templateVars = { 
    urls: urlDatabase,
    user: users[req.cookies["user_id"]]
  };
  res.render('urls_index', templateVars);
});

//create new URL page
app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_new", templateVars);
});

// register page
app.get('/register', (req, res) => {
  const templateVars = { 
    user: users[req.cookies["user_id"]]
  };
  res.render('register', templateVars);
})

// shortURL page
app.get('/urls/:shortURL', (req, res) => {
  // the route parameter will be based on user input
  const templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL],
    user: users[req.cookies["user_id"]] };
  res.render('urls_show', templateVars);
})


// redirect from the shortener as long as the server is online
app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];

  if (!longURL.includes('http://')) {
    res.redirect(`http://${longURL}`);
  } else {
    res.redirect(longURL);
  }
})

////////////////////////////////////////////////////////////////
// POST method
////////////////////////////////////////////////////////////////

// setting up cookie
app.post('/login', (req, res) => {
  for (const user in users) {
    if (emailLookUp(req.body, users) && users[user]["password"] === req.body.password) {
      res.cookie("user_id", user);
      return res.redirect('/urls');
    }
  }

  res.statusCode = 403;
  res.send(res.statusCode);
})

app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
})



app.post('/register', (req, res) => {
  if (emailLookUp(req.body, users)) {
    res.statusCode = 400;
    res.clearCookie("user_id");
    return res.sendStatus(res.statusCode);
  } else {
    let generatedID = randomID();
    users[generatedID] = {
      id: generatedID,
      email: req.body.email,
      password: req.body.password
    }
    res.cookie('user_id', generatedID);
    res.redirect('/urls');
  }
})

// for new short URL creation
app.post('/urls', (req, res) => {
  let shortURL = randomID();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});


// use POST method to delete URL
app.post('/urls/:shortURL/delete', (req, res) => {
  let shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect('/urls');
})

// Uuse POST method to update URL
app.post('/urls/:id', (req, res) => {
  let shortURL = req.params.id
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect('/urls');
});



////////////////////////////////////////////////////////////////
// Error catcher and misc.
////////////////////////////////////////////////////////////////


app.get('*', (req, res) => {
  res.statusCode = 404;
  return res.sendStatus(res.statusCode);
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});


////////////////////////////////////////////////////////////////
// Functions to be exported
////////////////////////////////////////////////////////////////

function randomID() {
  return Math.floor((1 + Math.random()) * 0x100000).toString(16);
}

function emailLookUp(reqBody, DataBase) {
  for (let id in DataBase) {
    if (DataBase[id]["email"] === reqBody["email"]) {
      return true;
    }
  }
  return false;
}

