/*
 * Copyright (c) 2014-2023 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { type Request, type Response, type NextFunction } from 'express'
import { UserModel } from '../models/user'
import challengeUtils = require('../lib/challengeUtils')

const security = require('../lib/insecurity')
const cache = require('../data/datacache')
const challenges = cache.challenges

module.exports = function changePassword () {
  return ({ query, headers, connection }: Request, res: Response, next: NextFunction) => {
    const currentPassword = query.current
    const newPassword = query.new
    const newPasswordInString = newPassword?.toString()
    const repeatPassword = query.repeat
    
    // SECURITY FIX: Always require current password to prevent CSRF/session hijacking attacks
    if (!currentPassword) {
      res.status(401).send(res.__('Current password is required.'))
      return
    }
    
    if (!newPassword || newPassword === 'undefined') {
      res.status(401).send(res.__('Password cannot be empty.'))
      return
    }
    
    if (newPassword !== repeatPassword) {
      res.status(401).send(res.__('New and repeated password do not match.'))
      return
    }
    
    // SECURITY FIX: Enforce minimum password requirements
    if (newPasswordInString && newPasswordInString.length < 8) {
      res.status(400).send(res.__('Password must be at least 8 characters long.'))
      return
    }
    
    const token = headers.authorization ? headers.authorization.substr('Bearer='.length) : null
    const loggedInUser = security.authenticatedUsers.get(token)
    
    if (loggedInUser) {
      // SECURITY FIX: Always verify current password before allowing password change
      if (security.hash(currentPassword.toString()) !== loggedInUser.data.password) {
        res.status(401).send(res.__('Current password is not correct.'))
        return
      }
      
      UserModel.findByPk(loggedInUser.data.id).then((user: UserModel | null) => {
        if (user != null) {
          user.update({ password: newPasswordInString }).then((user: UserModel) => {
            res.json({ user })
          }).catch((error: Error) => {
            next(error)
          })
        }
      }).catch((error: Error) => {
        next(error)
      })
    } else {
      next(new Error('Blocked illegal activity by ' + connection.remoteAddress))
    }
  }
}
