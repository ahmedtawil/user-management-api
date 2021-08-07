const bcrypt = require ('bcrypt');
const salt =  "$2b$12$PdPDqzPVFjJtjBLoRLkzufu";
module.exports = {
    hash : password => bcrypt.hash(password , salt),
    compare : (password , hash) => bcrypt.compare(password, hash)
}