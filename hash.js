const bcrypt = require('bcryptjs');

const salt = bcrypt.genSaltSync(10);

const hash = bcrypt.hashSync('1234', salt)

console.log(salt);
console.log(hash);


console.log(bcrypt.compareSync('1234', hash));