function randomID() {
  return Math.floor((1 + Math.random()) * 0x1000000).toString(16).substring(1);
}

function emailLookUp(reqBody, dataBase) {
  for (let id in dataBase) {
    if (dataBase[id]["email"] === reqBody["email"]) {
      return true;
    }
  }
  return false;
}

function authentication(req, dataBase) {
  for (const user in dataBase) {
    if (dataBase[user]["id"] === req.cookies["user_id"]) {
      return true;
    }
  }
  return false;
};

function urlsForUser(req, dataBase) {
  const newDataBase = {};
  for (const item in dataBase) {
    if (req.cookies["user_id"] === dataBase[item]["userID"]) {
      newDataBase[item] = dataBase[item];
    }
  }
  return newDataBase;
}

module.exports = {
  randomID,
  emailLookUp,
  authentication,
  urlsForUser
}
