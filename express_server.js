const express = require('express');
const morgan = require('morgan');
const bcrypt = require('bcryptjs');
const cookieSession = require('cookie-session');
const methodOverride = require('method-override');
const { randomID, getUserByEmail, urlsForUser, isAuthenticated } = require('./helpers');

const app = express();
const PORT = 8080;

/////////////////////////////////////////////////////////////
// Middleware
/////////////////////////////////////////////////////////////
app.use(morgan('dev'));
app.set('view engine', 'ejs');
app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));
app.use(cookieSession({
  name: 'session',
  keys: ['fujita', 'piggy', 'family']
}));

/////////////////////////////////////////////////////////////
// DataBases
/////////////////////////////////////////////////////////////

const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    dateSince: "May 19 2022",
    userID: "test",
    totalVisits: 0,
    uniqueVisits: []
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    dateSince: "May 10 2022",
    userID: "userRandomID",
    totalVisits: 0,
    uniqueVisits: []
  }
}

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "$2a$10$GPSn.vvLhuzJp2ydhidEGeMeNalkHc1j1GXEjLJIuPM7QPRX0kDb2"
    // when testing, use 1234 for password
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "$2a$10$HdCPE9VSvpw8o3rcsVEcc.FJDC/RCUEzLlf9fiBfvswRSNXQn3LM2"
    // when testing, use 12345 for password
  },
  "test": {
    id: "test", 
    email: "test@test.com", 
    password: "$2a$10$Syuo03sCkYb6gFelM3dnCu6gEQWvJ65Uuk/k0UaFp3Q8kCsWKesYS"
    // when testing, use 1234 for password
  }
}

/////////////////////////////////////////////////////////////
// GET
/////////////////////////////////////////////////////////////

// index page for redirection. If logged in, redirect to main user inferface, else redirect to login page
app.get('/', (req, res) => {
  if(isAuthenticated(req, users)) {
    return res.redirect('urls');
  } else {
    return res.redirect('/login');
  }
});

// login page
app.get('/login', (req, res) => {
  if (isAuthenticated(req, users)) {
    return res.redirect('/urls');
  } else {
    const templateVars = {
      user: users[req.session.userID]
    };
    return res.render('login', templateVars);
  }
});

// main user interface once logged in
app.get('/urls', (req, res) => {
  if (isAuthenticated(req, users)) {
    const newDataBase = urlsForUser(req, urlDatabase);
    const templateVars = {
      urls: newDataBase,
      user: users[req.session.userID]
    };
    return res.render('urls_index', templateVars)
  } else {
    res.redirect('/login');
  }
});

// new shortURL creation page
app.get('/urls/new', (req, res) => {
  if (isAuthenticated(req, users)) {
    const templateVars = {
      user: users[req.session.userID]
    };
    return res.render('urls_new', templateVars);
  } else {
    res.redirect('/login');
  }
});

// account registration page
app.get('/register', (req, res) => {
  if (isAuthenticated(req, users)) {
    return res.render('/urls');
  } else {
    const templateVars = {
      user: users[req.session.userID]
    };
    res.render('register', templateVars);
  }
});

// actual shortURL page
app.get('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;

  urlDatabase[shortURL]['totalVisits']++;

  const ip = req.headers['X-forwarded-for'] || req.socket.remoteAddress;
  const uniqueVisits = urlDatabase[shortURL]['uniqueVisits'];

  if (!uniqueVisits.includes(ip)) {
    uniqueVisits.push(ip);
  };

  const keys = Object.keys(urlDatabase);
  for (const key of keys) {
    if (key === shortURL) {
      const templateVars = {
        shortURL: key,
        user: users[req.session.userID],
        authentication: isAuthenticated(req, users),
        longURL: urlDatabase[key]["longURL"],
        dateSince: urlDatabase[key]["dateSince"],
      }
      return res.render('urls_show', templateVars)
    }
  }
  res.statusCode = 404;
  res.sendStatus(res.statusCode);
});

// redirection page for shortURL
app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]["longURL"];

  if(!longURL.includes('http://')) {
    return res.redirect(`http://${longURL}`);
  } else {
    res.redirect(longURL);
  }
});

/////////////////////////////////////////////////////////////
// POST
/////////////////////////////////////////////////////////////

// registration and go back to login page
app.post('/register', (req, res) => {
  const email = req.body.email;
  const user = getUserByEmail(email, users);
  if (user !== undefined) {
    res.statusCode = 400;
    req.session = null;
    return res.send('User already registered, please try another email address');
  } else {
    const salt = bcrypt.genSaltSync(10);
    const password = bcrypt.hashSync(req.body.password, salt);
    const id = randomID();

    users[id] = {
      id,
      email,
      password
    }
    res.redirect('/login');
  }
});

// login
app.post('/login', (req, res) => {
  const password = req.body.password;
  const email = req.body.email;
  const user = getUserByEmail(email, users);

  for (const id in users) {
    const hashResult = bcrypt.compareSync(password, users[id]['password']);
    if (user !== undefined && users[id]['email'] === email && hashResult) {
      req.session['userID'] = id;
      return res.redirect('/urls');
    }
  }
  res.statusCode = 403;
  res.send('Invalid username or password');
});

// logout
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/login');
});

// creation of new shortURL
app.post('/urls', (req, res) => {
  if (isAuthenticated(req, users)) {
    const longURL = req.body.longURL;
    const userID = req.session.userID;
    const dateSince = new Date().toString().substring(4, 15);
    const id = randomID();
    urlDatabase[id] = {
      longURL,
      dateSince,
      userID,
      totalVisits: 0,
      uniqueVisits: []
    }
    return res.redirect(`/urls/${id}`);
  } else {
    res.statusCode = 403;
    res.sendStatus(res.statusCode);
  }
});


/////////////////////////////////////////////////////////////
// Strtech: Method-override
/////////////////////////////////////////////////////////////

// update existing shortURL
app.put('/urls/:shortURL', (req, res) =>{
  if (isAuthenticated(req, users)) {
    const shortURL = req.params.shortURL;
    urlDatabase[shortURL]["longURL"] = req.body.longURL;
    return res.redirect('/urls');
  } else {
    res.statusCode = 403;
    res.sendStatus(res.statusCode);
  }
});


// delete any existing shortURL
app.delete('/urls/:shortURL', (req, res) =>{
  if (isAuthenticated(req, users)) {
    const shortURL = req.params.shortURL;
    delete urlDatabase[shortURL];
    return res.redirect('/urls/');
  } else {
    res.statusCode = 403;
    res.sendStatus(res.statusCode);
  }
});


/////////////////////////////////////////////////////////////
// Error catcher and misc.
/////////////////////////////////////////////////////////////

app.get('*', (req, res) => {
  res.statusCode = 404;
  res.sendStatus(res.statusCode);
});

app.listen(PORT, () => {
  console.log(`Welcome. TinyApp Server listening on port ${PORT}` );
});