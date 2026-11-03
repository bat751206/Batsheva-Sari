const verifyRoles =  (req, res, next) => {
  if (!req.user ||req.user.roles !== 'Admin') {
    return res.status(403).json({ message: "Forbidden" })
  }

  next()
}

module.exports = verifyRoles