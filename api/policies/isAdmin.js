module.exports = (req, res, next) => {
  if(req.user.role !== 'admin')  return res.forbidden({ err: 'you are not authorized to open this rout!' });
  next()
}