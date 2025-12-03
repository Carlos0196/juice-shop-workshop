/*
 * Copyright (c) 2014-2023 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import path = require('path')
import { type Request, type Response, type NextFunction } from 'express'

import * as utils from '../lib/utils'
const security = require('../lib/insecurity')

module.exports = function servePublicFiles () {
  return ({ params, query }: Request, res: Response, next: NextFunction) => {
    const file = params.file

    // SECURITY FIX: Comprehensive path traversal prevention
    // Block forward slashes, backslashes, and other dangerous characters
    if (!file || file.includes('/') || file.includes('\\') || file.includes('..')) {
      res.status(403)
      next(new Error('Invalid file name!'))
      return
    }
    
    verify(file, res, next)
  }

  function verify (file: string, res: Response, next: NextFunction) {
    // SECURITY FIX: Remove null byte sequences before validation
    // This prevents null byte injection attacks that bypass file type checks
    let sanitizedFile = file.replace(/%00/g, '').replace(/\0/g, '')
    
    // SECURITY FIX: Only allow specific safe file types
    if (sanitizedFile && endsWithAllowlistedFileType(sanitizedFile)) {
      // SECURITY FIX: Use basename to ensure no path components sneak through
      sanitizedFile = path.basename(sanitizedFile)
      
      // SECURITY FIX: Verify the resolved path is within the ftp directory
      const ftpDir = path.resolve('ftp/')
      const resolvedPath = path.resolve(ftpDir, sanitizedFile)
      
      if (!resolvedPath.startsWith(ftpDir)) {
        res.status(403)
        next(new Error('Access denied!'))
        return
      }

      res.sendFile(resolvedPath)
    } else {
      res.status(403)
      next(new Error('Only .md and .pdf files are allowed!'))
    }
  }

  function endsWithAllowlistedFileType (param: string) {
    // SECURITY FIX: Check the actual file extension, not just if the string ends with it
    const ext = path.extname(param).toLowerCase()
    return ext === '.md' || ext === '.pdf'
  }
}
