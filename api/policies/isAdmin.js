module.exports = (req, res, next) => {
  console.log(req.user.role);
  if(req.user.role !== 'admin')  return res.forbidden({ err: 'you are not authorized to open this rout!' });
  next()
 
}