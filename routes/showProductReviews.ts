/*
 * Copyright (c) 2014-2023 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import utils = require('../lib/utils')
import challengeUtils = require('../lib/challengeUtils')
import { type Request, type Response, type NextFunction } from 'express'
import { type Review } from 'data/types'

const challenges = require('../data/datacache').challenges
const security = require('../lib/insecurity')
const db = require('../data/mongodb')

// Blocking sleep function as in native MongoDB
// @ts-expect-error FIXME Type safety broken for global object
global.sleep = (time: number) => {
  // Ensure that users don't accidentally dos their servers for too long
  if (time > 2000) {
    time = 2000
  }
  const stop = new Date().getTime()
  while (new Date().getTime() < stop + time) {
    ;
  }
}

module.exports = function productReviews () {
  return (req: Request, res: Response, next: NextFunction) => {
    // SECURITY FIX: Always convert to number to prevent NoSQL injection
    const id = Number(req.params.id)
    
    // Validate that id is a valid number
    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid product ID' })
      return
    }

    // SECURITY FIX: Use safe query syntax instead of $where with user input
    db.reviews.find({ product: id }).then((reviews: Review[]) => {
      const user = security.authenticatedUsers.from(req)
      for (let i = 0; i < reviews.length; i++) {
        if (user === undefined || reviews[i].likedBy.includes(user.data.email)) {
          reviews[i].liked = true
        }
      }
      res.json(utils.queryResultToJson(reviews))
    }, () => {
      res.status(400).json({ error: 'Wrong Params' })
    })
  }
}
