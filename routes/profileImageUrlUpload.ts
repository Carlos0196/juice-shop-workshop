/*
 * Copyright (c) 2014-2023 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import fs = require('fs')
import { type Request, type Response, type NextFunction } from 'express'
import logger from '../lib/logger'

import { UserModel } from '../models/user'
import * as utils from '../lib/utils'
const security = require('../lib/insecurity')
import fetch from 'node-fetch'

module.exports = function profileImageUrlUpload () {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (req.body.imageUrl !== undefined) {
      const url = req.body.imageUrl
      if (url.match(/(.)*solve\/challenges\/server-side(.)*/) !== null) req.app.locals.abused_ssrf_bug = true
      const loggedInUser = security.authenticatedUsers.get(req.cookies.token)
      if (loggedInUser) {
        try {
          const response = await fetch(url)
          if (response.ok) {
            const ext = ['jpg', 'jpeg', 'png', 'svg', 'gif'].includes(url.split('.').slice(-1)[0].toLowerCase()) ? url.split('.').slice(-1)[0].toLowerCase() : 'jpg'
            const destPath = `frontend/dist/frontend/assets/public/images/uploads/${loggedInUser.data.id}.${ext}`
            const fileStream = fs.createWriteStream(destPath)
            await new Promise((resolve, reject) => {
              response.body.pipe(fileStream)
              response.body.on('error', reject)
              fileStream.on('finish', resolve)
            })
            await UserModel.findByPk(loggedInUser.data.id).then(async (user: UserModel | null) => { return await user?.update({ profileImage: `/assets/public/images/uploads/${loggedInUser.data.id}.${ext}` }) })
          } else {
            await UserModel.findByPk(loggedInUser.data.id).then(async (user: UserModel | null) => { return await user?.update({ profileImage: url }) })
            logger.warn(`Error retrieving user profile image: ${response.statusText}; using image link directly`)
          }
        } catch (err) {
          await UserModel.findByPk(loggedInUser.data.id).then(async (user: UserModel | null) => { return await user?.update({ profileImage: url }) })
          logger.warn(`Error retrieving user profile image: ${utils.getErrorMessage(err)}; using image link directly`)
        }
      } else {
        next(new Error('Blocked illegal activity by ' + req.socket.remoteAddress))
      }
    }
    res.location(process.env.BASE_PATH + '/profile')
    res.redirect(process.env.BASE_PATH + '/profile')
  }
}
