const { randomID, emailLookUp, authentication, urlsForUser } = require('./functions');

const express = require('express');
const morgan = require('morgan'); 
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

const app = express();
const PORT = 8080;

// use of middleware
app.use(morgan('dev'));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    dateSince: "2022-05-19T03:46:18.676Z",
    userID: "test"
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    dateSince: "2022-05-19T03:49:30.577Z",
    userID: "userRandomID"
  }
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



////////////////////////////////////////////////////////////////
// GET method
////////////////////////////////////////////////////////////////

app.get('/', (req, res) => {
  if (authentication(req, users)) {
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
})

//login page
app.get('/login', (req, res) => {
  if (authentication(req, users)) {
    return res.redirect('/urls');
  } else {
    const templateVars = {
      user: users[req.cookies["user_id"]]
    };
    res.render('login', templateVars);
  }
});



//home page
app.get('/urls', (req, res) => {
  if (authentication(req, users)) {
    const newDataBase = urlsForUser(req, urlDatabase);
    const templateVars = { 
      urls: newDataBase,
      user: users[req.cookies["user_id"]]
    };
    return res.render('urls_index', templateVars);
  } else {
    res.redirect('/login');
  }
});

//create new URL page
app.get("/urls/new", (req, res) => {
  for (let user in users) {
    if (users[user]["id"] === req.cookies["user_id"]) {
      const templateVars = {
        user: users[req.cookies["user_id"]]
      };
      return res.render("urls_new", templateVars);
    }
  }
  res.redirect('/login');
});

// register page
app.get('/register', (req, res) => {
  if (authentication(req, users)) {
    return res.redirect('/urls');
  } else {
    const templateVars = { 
      user: users[req.cookies["user_id"]]
    };
    res.render('register', templateVars);
  }
})

// shortURL page
app.get('/urls/:shortURL', (req, res) => {
  const keys = Object.keys(urlDatabase);
  for (let key of keys) {
    if (key === req.params.shortURL) {
      const templateVars = { 
        shortURL: req.params.shortURL, 
        longURL: urlDatabase[req.params.shortURL]["longURL"],
        dateSince: urlDatabase[req.params.shortURL]["dateSince"],
        user: users[req.cookies["user_id"]],
        authentication: authentication(req, users)
       };
      return res.render('urls_show', templateVars);
    }
  }
  res.statusCode = 404;
  res.sendStatus(res.statusCode);
})


// redirect from the shortener as long as the server is online
app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]["longURL"];

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
    if (authentication(req, users)) {
      let shortURL = randomID();
      urlDatabase[shortURL] = {
        "longURL": req.body.longURL,
        "dateSince": (new Date()).toString(),
        "userID": req.cookies["user_id"],
      }
      console.log(urlDatabase);
      return res.redirect(`/urls/${shortURL}`);
      } else {
        res.redirect('/login');
      }
});


// use POST method to delete URL
app.post('/urls/:shortURL/delete', (req, res) => {
  if (authentication(req, users)) {
    let shortURL = req.params.shortURL;
    delete urlDatabase[shortURL];
    return res.redirect('/urls');
  } else {
    res.statusCode = 403;
    return res.sendStatus(res.statusCode)
  }
})

// Uuse POST method to update URL
app.post('/urls/:id', (req, res) => {
  if (authentication(req, users)) {
    let shortURL = req.params.id
    urlDatabase[shortURL]["longURL"] = req.body.longURL;
    return res.redirect('/urls');
  } else {
    res.statusCode = 404;
    res.sendStatus(res.statusCode);
  }

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