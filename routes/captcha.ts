/*
 * Copyright (c) 2014-2023 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { type Request, type Response, type NextFunction } from 'express'
import { type Captcha } from '../data/types'
import { CaptchaModel } from '../models/captcha'

// SECURITY FIX: Safe math expression evaluator without using eval()
function safeEvaluate (firstTerm: number, firstOp: string, secondTerm: number, secondOp: string, thirdTerm: number): number {
  // Calculate following order of operations (multiplication first)
  let result: number
  
  // First, handle any multiplications
  let leftValue = firstTerm
  let rightValue = thirdTerm
  let middleValue = secondTerm
  
  if (firstOp === '*') {
    leftValue = firstTerm * secondTerm
    middleValue = leftValue
    // Now apply second operator to leftValue and thirdTerm
    if (secondOp === '*') return leftValue * thirdTerm
    if (secondOp === '+') return leftValue + thirdTerm
    if (secondOp === '-') return leftValue - thirdTerm
  } else if (secondOp === '*') {
    rightValue = secondTerm * thirdTerm
    // Now apply first operator to firstTerm and rightValue
    if (firstOp === '+') return firstTerm + rightValue
    if (firstOp === '-') return firstTerm - rightValue
  } else {
    // No multiplication, evaluate left to right
    if (firstOp === '+') {
      middleValue = firstTerm + secondTerm
    } else if (firstOp === '-') {
      middleValue = firstTerm - secondTerm
    }
    
    if (secondOp === '+') return middleValue + thirdTerm
    if (secondOp === '-') return middleValue - thirdTerm
  }
  
  return 0
}

function captchas () {
  return async (req: Request, res: Response) => {
    const captchaId = req.app.locals.captchaId++
    const operators = ['*', '+', '-']

    const firstTerm = Math.floor((Math.random() * 10) + 1)
    const secondTerm = Math.floor((Math.random() * 10) + 1)
    const thirdTerm = Math.floor((Math.random() * 10) + 1)

    const firstOperator = operators[Math.floor((Math.random() * 3))]
    const secondOperator = operators[Math.floor((Math.random() * 3))]

    const expression = firstTerm.toString() + firstOperator + secondTerm.toString() + secondOperator + thirdTerm.toString()
    // SECURITY FIX: Use safe math evaluation instead of eval()
    const answer = safeEvaluate(firstTerm, firstOperator, secondTerm, secondOperator, thirdTerm).toString()

    const captcha = {
      captchaId,
      captcha: expression,
      answer
    }
    const captchaInstance = CaptchaModel.build(captcha)
    await captchaInstance.save()
    
    // SECURITY FIX: Don't send the answer to the client!
    res.json({
      captchaId,
      captcha: expression
      // answer intentionally omitted - should only be stored server-side
    })
  }
}

captchas.verifyCaptcha = () => (req: Request, res: Response, next: NextFunction) => {
  CaptchaModel.findOne({ where: { captchaId: req.body.captchaId } }).then((captcha: Captcha | null) => {
    if ((captcha != null) && req.body.captcha === captcha.answer) {
      next()
    } else {
      res.status(401).send(res.__('Wrong answer to CAPTCHA. Please try again.'))
    }
  }).catch((error: Error) => {
    next(error)
  })
}

module.exports = captchas
