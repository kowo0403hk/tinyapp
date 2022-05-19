const { randomID, emailLookUp, urlsForUser, authentication } = require('./functions');
const express = require('express');
const morgan = require('morgan');
const bcrypt = require('bcryptjs');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = 8080;

/////////////////////////////////////////////////////////////
// Middleware
/////////////////////////////////////////////////////////////
app.use(morgan('dev'));
app.set('view engine', 'ejs');
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());

/////////////////////////////////////////////////////////////
// DataBases
/////////////////////////////////////////////////////////////

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
    password: "$2a$10$GPSn.vvLhuzJp2ydhidEGeMeNalkHc1j1GXEjLJIuPM7QPRX0kDb2"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "$2a$10$HdCPE9VSvpw8o3rcsVEcc.FJDC/RCUEzLlf9fiBfvswRSNXQn3LM2"
  },
  "test": {
    id: "test", 
    email: "test@test.com", 
    password: "$2a$10$Syuo03sCkYb6gFelM3dnCu6gEQWvJ65Uuk/k0UaFp3Q8kCsWKesYS"
  }
}


/////////////////////////////////////////////////////////////
// GET
/////////////////////////////////////////////////////////////

app.get('/', (req, res) => {
  if(authentication(req, users)) {
    return res.redirect('urls');
  } else {
    return res.redirect('/login');
  }
});

app.get('/login', (req, res) => {
  if (authentication(req, users)) {
    return res.redirect('/urls');
  } else {
    const templateVars = {
      user: users[req.cookies['user_id']]
    };
    return res.render('login', templateVars);
  }
});

app.get('/urls', (req, res) => {
  console.log(users);
  if (authentication(req, users)) {
    const newDataBase = urlsForUser(req, urlDatabase);
    const templateVars = {
      urls: newDataBase,
      user: users[req.cookies['user_id']]
    };
    return res.render('urls_index', templateVars)
  } else {
    res.redirect('/login');
  }
});

app.get('/urls/new', (req, res) => {
  if (authentication(req, users)) {
    const templateVars = {
      user: users[req.cookies['user_id']]
    };
    return res.render('urls_new', templateVars);
  } else {
    res.redirect('/login');
  }
});

app.get('/register', (req, res) => {
  if (authentication(req, users)) {
    return res.render('/urls');
  } else {
    const templateVars = {
      user: users[req.cookies['user_id']]
    };
    res.render('register', templateVars);
  }
});

app.get('/urls/:shortURL', (req, res) => {
  const keys = Object.keys(urlDatabase);
  for (let key of keys) {
    if (key === req.params.shortURL) {
      const templateVars = {
        shortURL: key,
        user: users[req.cookies['user_id']],
        authentication: authentication(req, users),
        longURL: urlDatabase[key]["longURL"],
        dateSince: urlDatabase[key]["dateSince"],
      }
      return res.render('urls_show', templateVars)
    }
  }
  res.statusCode = 404;
  res.sendStatus(res.statusCode);
})

app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]["longURL"];

  if(!longURL.includes('http://')) {
    return res.redirect(`http://${longURL}`);
  } else {
    res.redirect(longURL);
  }
})

/////////////////////////////////////////////////////////////
// POST
/////////////////////////////////////////////////////////////

app.post('/register', (req, res) => {
  if (emailLookUp(req.body, users)) {
    res.statusCode = 400;
    res.clearCookie('user_id');
    return res.send('User already registered, please try another email address');
  } else {
    const salt = bcrypt.genSaltSync(10);
    const password = bcrypt.hashSync(req.body.password, salt);
    let id = randomID();
    let email = req.body.email;

    users[id] = {
      id,
      email,
      password
    }
    res.redirect('/login');
  }
});

app.post('/login', (req, res) => {
  let password = req.body.password;
  let email = req.body.email;

  for (const id in users) {
    const hashResult = bcrypt.compareSync(password, users[id]["password"]);
    if (emailLookUp(req.body, users) && users[id]['email'] === email && hashResult) {
      res.cookie('user_id', id);
      return res.redirect('/urls');
    }
  }

  res.statusCode = 403;
  res.send('Invalid username or password');
});

app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/login');
})

app.post('/urls', (req, res) => {
  if (authentication(req, users)) {
    const longURL = req.body.longURL;
    const userID = req.cookies['user_id'];
    const dateSince = new Date().toString();
    const id = randomID();
    urlDatabase[id] = {
      longURL,
      dateSince,
      userID
    }
    return res.redirect(`/urls/${id}`);
  }
});

app.post('/urls/:id', (req, res) =>{
  if (authentication(req, users)) {
    let id = req.params.id;
    urlDatabase[id]["longURL"] = req.body.longURL;
    return res.redirect('/urls');
  } else {
    res.statusCode = 403;
    res.sendStatus(res.statusCode);
  }
});

app.post('/urls/:id/delete', (req, res) =>{
  if (authentication(req, users)) {
    let id = req.params.id;
    delete urlDatabase[id];
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
})

app.listen(PORT, () => {
  console.log(`Welcome. TinyApp Server listening on port ${PORT}` );
})