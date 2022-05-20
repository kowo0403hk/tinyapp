function randomID() {
  return Math.floor((1 + Math.random()) * 0x1000000).toString(16).substring(1);
}


function getUserByEmail(email, dataBase) {
  for (const id in dataBase) {
    if (dataBase[id]["email"] === email)
    return id;
  }
  return undefined;
}

function isAuthenticated(req, dataBase) {
  for (const user in dataBase) {
    if (dataBase[user]["id"] === req.session.userID) {
      return true;
    }
  }
  return false;
};

function urlsForUser(req, dataBase) {
  const newDataBase = {};
  for (const item in dataBase) {
    if (req.session.userID === dataBase[item]["userID"]) {
      newDataBase[item] = dataBase[item];
    }
  }
  return newDataBase;
}

module.exports = {
  randomID,
  getUserByEmail,
  isAuthenticated,
  urlsForUser
}
