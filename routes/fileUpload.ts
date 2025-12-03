/*
 * Copyright (c) 2014-2023 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import os from 'os'
import fs = require('fs')
import { type NextFunction, type Request, type Response } from 'express'
import path from 'path'
import vm = require('vm')
import * as utils from '../lib/utils'

const libxml = require('libxmljs2')
const unzipper = require('unzipper')

function ensureFileIsPassed ({ file }: Request, res: Response, next: NextFunction) {
  if (file != null) {
    next()
  }
}

function handleZipFileUpload ({ file }: Request, res: Response, next: NextFunction) {
  if (utils.endsWith(file?.originalname.toLowerCase(), '.zip')) {
    if (((file?.buffer) != null) && !utils.disableOnContainerEnv()) {
      const buffer = file.buffer
      const filename = file.originalname.toLowerCase()
      const tempFile = path.join(os.tmpdir(), filename)
      fs.open(tempFile, 'w', function (err, fd) {
        if (err != null) { next(err) }
        fs.write(fd, buffer, 0, buffer.length, null, function (err) {
          if (err != null) { next(err) }
          fs.close(fd, function () {
            fs.createReadStream(tempFile)
              .pipe(unzipper.Parse())
              .on('entry', function (entry: any) {
                const fileName = entry.path
                
                // SECURITY FIX: Prevent Zip Slip attack by validating path
                // Reject any paths containing ".." or starting with "/"
                if (fileName.includes('..') || fileName.startsWith('/') || fileName.startsWith('\\')) {
                  entry.autodrain()
                  return
                }
                
                // Sanitize filename - only allow alphanumeric, dots, underscores, hyphens
                const sanitizedFileName = path.basename(fileName).replace(/[^a-zA-Z0-9._-]/g, '_')
                const targetDir = path.resolve('uploads/complaints/')
                const absolutePath = path.resolve(targetDir, sanitizedFileName)
                
                // SECURITY FIX: Ensure the resolved path is still within the target directory
                if (!absolutePath.startsWith(targetDir)) {
                  entry.autodrain()
                  return
                }
                
                entry.pipe(fs.createWriteStream(absolutePath).on('error', function (err) { next(err) }))
              }).on('error', function (err: unknown) { next(err) })
          })
        })
      })
    }
    res.status(204).end()
  } else {
    next()
  }
}

function checkUploadSize ({ file }: Request, res: Response, next: NextFunction) {
  // SECURITY FIX: Enforce file size limit
  const MAX_FILE_SIZE = 100000 // 100KB
  if (file != null && file.size > MAX_FILE_SIZE) {
    res.status(413).json({ error: 'File too large. Maximum size is 100KB.' })
    return
  }
  next()
}

function checkFileType ({ file }: Request, res: Response, next: NextFunction) {
  // SECURITY FIX: Only allow specific file types
  const allowedTypes = ['pdf', 'xml', 'zip']
  const fileType = file?.originalname.substr(file.originalname.lastIndexOf('.') + 1).toLowerCase()
  if (fileType && !allowedTypes.includes(fileType)) {
    res.status(415).json({ error: 'Invalid file type. Only PDF, XML, and ZIP files are allowed.' })
    return
  }
  next()
}

function handleXmlUpload ({ file }: Request, res: Response, next: NextFunction) {
  if (utils.endsWith(file?.originalname.toLowerCase(), '.xml')) {
    if ((file?.buffer) != null) {
      const data = file.buffer.toString()
      try {
        // SECURITY FIX: Use vm sandbox with timeout to prevent XML DoS attacks (billion laughs)
        // The timeout ensures that malicious XML that causes infinite expansion is terminated
        const sandbox = { libxml, data }
        vm.createContext(sandbox)
        
        // SECURITY FIX: Parse XML with secure options inside a timeout-protected sandbox
        // noent: false - don't substitute entities (prevents XXE file disclosure)
        // nonet: true - disable network access (prevents SSRF via XXE)
        // dtdload: false - don't load external DTDs
        // dtdvalid: false - don't validate against DTD
        const xmlDoc = vm.runInContext(
          'libxml.parseXml(data, { noblanks: true, noent: false, nocdata: true, nonet: true, dtdload: false, dtdvalid: false })',
          sandbox,
          { timeout: 2000 }  // 2 second timeout to prevent DoS
        )
        const xmlString = xmlDoc.toString(false)
        res.status(410)
        next(new Error('B2B customer complaints via file upload have been deprecated for security reasons: ' + utils.trunc(xmlString, 400) + ' (' + file.originalname + ')'))
      } catch (err: any) {
        // Check if it was a timeout (DoS attack attempt)
        if (err.message && err.message.includes('Script execution timed out')) {
          res.status(503)
          next(new Error('Request timed out - XML processing took too long'))
        } else {
          res.status(410)
          next(new Error('B2B customer complaints via file upload have been deprecated for security reasons: ' + err.message + ' (' + file.originalname + ')'))
        }
      }
    } else {
      res.status(410)
      next(new Error('B2B customer complaints via file upload have been deprecated for security reasons (' + file?.originalname + ')'))
    }
  }
  res.status(204).end()
}

module.exports = {
  ensureFileIsPassed,
  handleZipFileUpload,
  checkUploadSize,
  checkFileType,
  handleXmlUpload
}
