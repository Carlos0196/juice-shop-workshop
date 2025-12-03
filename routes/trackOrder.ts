/*
 * Copyright (c) 2014-2023 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import utils = require('../lib/utils')
import challengeUtils = require('../lib/challengeUtils')
import { type Request, type Response } from 'express'

const challenges = require('../data/datacache').challenges
const db = require('../data/mongodb')

module.exports = function trackOrder () {
  return (req: Request, res: Response) => {
    // SECURITY FIX: Sanitize input to prevent XSS and NoSQL injection
    const id = String(req.params.id).replace(/[^\w-]+/g, '')

    // SECURITY FIX: Use safe query syntax instead of $where with user input
    db.orders.find({ orderId: id }).then((order: any) => {
      const result = utils.queryResultToJson(order)
      if (result.data[0] === undefined) {
        result.data[0] = { orderId: id }
      }
      res.json(result)
    }, () => {
      res.status(400).json({ error: 'Wrong Param' })
    })
  }
}
