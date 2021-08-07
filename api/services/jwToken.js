const jwt = require('jsonwebtoken')

tokenSecret = "RI4fs2cDQQ9CxIe55AsEZMxTEYCpplIV";

module.exports = {
    // Generates a token from supplied payload
    issue(payload) {
        return jwt.sign(
            payload,
            tokenSecret, // Token Secret that we sign it with
            {
                expiresIn: "15 days" // Token Expire time
            });
    },

    // Verifies token on a request
    verify(token, callback) {
        return jwt.verify(
            token, // The token to be verified
            tokenSecret, // Same token we used to sign
            {},
            callback //Pass errors or decoded token to callback
        );
    }
};
