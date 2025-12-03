/*
 * Copyright (c) 2014-2023 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { type Request, type Response, type NextFunction } from 'express'

const security = require('../lib/insecurity')

// SECURITY FIX: Removed unsafe eval/vm.runInContext - parse JSON safely instead
module.exports = function b2bOrder () {
  return ({ body }: Request, res: Response, next: NextFunction) => {
    try {
      // SECURITY FIX: Parse orderLinesData as JSON instead of evaluating it
      const orderLinesData = body.orderLinesData || '[]'
      
      // Validate it's valid JSON
      let parsedOrderLines
      try {
        parsedOrderLines = JSON.parse(orderLinesData)
      } catch (parseError) {
        res.status(400).json({ error: 'Invalid order data format. Expected JSON.' })
        return
      }

      // Validate the parsed data is an array
      if (!Array.isArray(parsedOrderLines)) {
        res.status(400).json({ error: 'Order lines must be an array' })
        return
      }

      // Validate each order line has required fields
      for (const line of parsedOrderLines) {
        if (typeof line !== 'object' || line === null) {
          res.status(400).json({ error: 'Invalid order line format' })
          return
        }
      }

      res.json({ cid: body.cid, orderNo: uniqueOrderNumber(), paymentDue: dateTwoWeeksFromNow() })
    } catch (err) {
      next(err)
    }
  }

  function uniqueOrderNumber () {
    return security.hash(new Date() + '_B2B')
  }

  function dateTwoWeeksFromNow () {
    return new Date(new Date().getTime() + (14 * 24 * 60 * 60 * 1000)).toISOString()
  }
}
