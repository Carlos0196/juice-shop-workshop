/*
 * Copyright (c) 2014-2023 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { type Request, type Response, type NextFunction } from 'express'

const db = require('../data/mongodb')
const security = require('../lib/insecurity')

// SECURITY FIX: Fixed NoSQL injection and unauthorized review modification
module.exports = function productReviews () {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = security.authenticatedUsers.from(req)
    
    // SECURITY FIX: Require authentication
    if (!user?.data?.email) {
      res.status(401).json({ error: 'Unauthorized' })
      return
    }

    // SECURITY FIX: Validate that id exists and is valid before converting to string
    // Check for null, undefined, or empty values before String conversion
    // String(null) becomes "null" and String(undefined) becomes "undefined" which would pass
    if (req.body.id === null || req.body.id === undefined || req.body.id === '') {
      res.status(400).json({ error: 'Invalid review ID' })
      return
    }
    const reviewId = String(req.body.id)
    // Additional validation: MongoDB ObjectId should be 24 hex characters
    if (!/^[a-fA-F0-9]{24}$/.test(reviewId)) {
      res.status(400).json({ error: 'Invalid review ID format' })
      return
    }

    // SECURITY FIX: Only allow users to update their own reviews
    // First, find the review to check ownership
    db.reviews.findOne({ _id: reviewId }).then((review: any) => {
      if (!review) {
        res.status(404).json({ error: 'Review not found' })
        return
      }

      // SECURITY FIX: Check that the user owns this review
      if (review.author !== user.data.email) {
        res.status(403).json({ error: 'You can only edit your own reviews' })
        return
      }

      // SECURITY FIX: Use multi: false to prevent mass updates
      db.reviews.update(
        { _id: reviewId, author: user.data.email },
        { $set: { message: String(req.body.message) } },
        { multi: false }
      ).then(
        (result: { modified: number }) => {
          res.json(result)
        }, (err: unknown) => {
          res.status(500).json(err)
        })
    }, () => {
      res.status(500).json({ error: 'Database error' })
    })
  }
}
