/*
 * Copyright (c) 2014-2023 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { type Request, type Response, type NextFunction } from 'express'
import { ProductModel } from '../models/product'
import { BasketModel } from '../models/basket'
import challengeUtils = require('../lib/challengeUtils')

import * as utils from '../lib/utils'
const security = require('../lib/insecurity')
const challenges = require('../data/datacache').challenges

module.exports = function retrieveBasket () {
  return (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id
    
    // SECURITY FIX: Add authorization check - users can only access their own basket
    const user = security.authenticatedUsers.from(req)
    if (!user) {
      res.status(401).json({ error: 'Unauthorized - please login' })
      return
    }
    
    // SECURITY FIX: Verify the user is accessing their own basket
    // Use explicit null/undefined check instead of truthy check to handle bid=0
    if (user.bid !== null && user.bid !== undefined && String(user.bid) !== String(id)) {
      res.status(403).json({ error: 'Access denied - you can only access your own basket' })
      return
    }
    
    BasketModel.findOne({ where: { id }, include: [{ model: ProductModel, paranoid: false, as: 'Products' }] })
      .then((basket: BasketModel | null) => {
        // SECURITY FIX: Additional check - verify basket belongs to the user
        if (basket && basket.UserId !== user.data.id) {
          res.status(403).json({ error: 'Access denied - basket does not belong to you' })
          return
        }
        
        if (((basket?.Products) != null) && basket.Products.length > 0) {
          for (let i = 0; i < basket.Products.length; i++) {
            basket.Products[i].name = req.__(basket.Products[i].name)
          }
        }

        res.json(utils.queryResultToJson(basket))
      }).catch((error: Error) => {
        next(error)
      })
  }
}
