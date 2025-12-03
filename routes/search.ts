/*
 * Copyright (c) 2014-2023 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { type Request, type Response, type NextFunction } from 'express'
import { Op } from 'sequelize'
import { ProductModel } from '../models/product'

import * as utils from '../lib/utils'

class ErrorWithParent extends Error {
  parent: Error | undefined
}

// SECURITY FIX: Removed SQL injection vulnerability by using Sequelize ORM with parameterized queries
module.exports = function searchProducts () {
  return (req: Request, res: Response, next: NextFunction) => {
    let criteria: any = req.query.q === 'undefined' ? '' : req.query.q ?? ''
    criteria = (criteria.length <= 200) ? criteria : criteria.substring(0, 200)
    // SECURITY FIX: Use Sequelize ORM with Op.like instead of raw SQL query
    ProductModel.findAll({
      where: {
        [Op.and]: [
          {
            [Op.or]: [
              { name: { [Op.like]: `%${criteria}%` } },
              { description: { [Op.like]: `%${criteria}%` } }
            ]
          },
          { deletedAt: null }
        ]
      },
      order: [['name', 'ASC']]
    })
      .then((products: ProductModel[]) => {
        // SECURITY FIX: Challenge verification code removed as SQL injection is now prevented
        const productsData = products.map((p: any) => p.dataValues || p)
        for (let i = 0; i < productsData.length; i++) {
          productsData[i].name = req.__(productsData[i].name)
          productsData[i].description = req.__(productsData[i].description)
        }
        res.json(utils.queryResultToJson(productsData))
      }).catch((error: ErrorWithParent) => {
        next(error.parent)
      })
  }
}
