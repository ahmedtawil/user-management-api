module.exports = (req, res, next) => {
  let token;
  if (req.headers && req.headers.authorization) {

    token = req.headers.authorization.split(' ')[1].trim()

    jwToken.verify(token, function (err, token) {
      if (err) return res.status(401).json({ msg: 'Invalid Token!' });
      req.user = token; // This is the decrypted token or the payload you provided
      next();
    });
  }else{
    res.status(401).json({ msg: 'no authorization token in request' });
  }
}