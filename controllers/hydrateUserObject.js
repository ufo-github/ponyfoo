'use strict'

const User = require(`../models/User`)
const userService = require(`../services/user`)

module.exports = function hydrateUserObject (req, res, next) {
  if (!req.user) {
    next(); return
  }
  const userFields = `roles displayName slug email avatar unlockCodes`
  User
    .findOne({ _id: req.user })
    .select(`${ userFields } impersonated`)
    .populate(`impersonated`, `${ userFields }`)
    .exec(foundUser)

  function foundUser (err, user) {
    if (err) {
      next(err); return
    }
    if (!user) {
      req.user = null
      next()
      return
    }
    if (user.impersonated && !req.ignoreImpersonation) {
      req.userImpersonator = user._id
      setUser(user.impersonated)
      return
    }
    setUser(user)
  }

  function setUser (user) {
    req.user = user._id
    req.userObject = {
      slug: user.slug,
      roles: user.roles,
      displayName: user.displayName,
      avatar: userService.getAvatar(user),
      unlockCodes: user.unlockCodes
    }
    next(null)
  }
}
