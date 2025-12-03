/*
 * Copyright (c) 2014-2023 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import fs = require('fs')
import { type Request, type Response } from 'express'
import config from 'config'
import * as utils from '../lib/utils'

const pug = require('pug')
const themes = require('../views/themes/themes').themes
const Entities = require('html-entities').AllHtmlEntities
const entities = new Entities()

exports.getVideo = () => {
  return (req: Request, res: Response) => {
    const path = videoPath()
    const stat = fs.statSync(path)
    const fileSize = stat.size
    const range = req.headers.range
    if (range) {
      const parts = range.replace(/bytes=/, '').split('-')
      const start = parseInt(parts[0], 10)
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1
      const chunksize = (end - start) + 1
      const file = fs.createReadStream(path, { start, end })
      const head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Location': '/assets/public/videos/owasp_promo.mp4',
        'Content-Type': 'video/mp4'
      }
      res.writeHead(206, head)
      file.pipe(res)
    } else {
      const head = {
        'Content-Length': fileSize,
        'Content-Type': 'video/mp4'
      }
      res.writeHead(200, head)
      fs.createReadStream(path).pipe(res)
    }
  }
}

exports.promotionVideo = () => {
  return (req: Request, res: Response) => {
    fs.readFile('views/promotionVideo.pug', function (err, buf) {
      if (err != null) throw err
      let template = buf.toString()
      const subs = getSubsFromFile()

      // SECURITY FIX: Sanitize subtitle content to prevent XSS
      // Remove any script tags and encode HTML entities
      const sanitizedSubs = subs
        .replace(/<script[^>]*>.*?<\/script>/gi, '')  // Remove script tags
        .replace(/</g, '&lt;')  // Encode < to prevent HTML injection
        .replace(/>/g, '&gt;')  // Encode > to prevent HTML injection

      const theme = themes[config.get<string>('application.theme')]
      template = template.replace(/_title_/g, entities.encode(config.get('application.name')))
      template = template.replace(/_favicon_/g, favicon())
      template = template.replace(/_bgColor_/g, theme.bgColor)
      template = template.replace(/_textColor_/g, theme.textColor)
      template = template.replace(/_navColor_/g, theme.navColor)
      template = template.replace(/_primLight_/g, theme.primLight)
      template = template.replace(/_primDark_/g, theme.primDark)
      const fn = pug.compile(template)
      let compiledTemplate = fn()
      // SECURITY FIX: Use sanitized subtitles
      compiledTemplate = compiledTemplate.replace('<script id="subtitle"></script>', '<script id="subtitle" type="text/vtt" data-label="English" data-lang="en">' + sanitizedSubs + '</script>')
      res.send(compiledTemplate)
    })
  }
  function favicon () {
    return utils.extractFilename(config.get('application.favicon'))
  }
}

function getSubsFromFile () {
  const subtitles = config.get<string>('application.promotion.subtitles') ?? 'owasp_promo.vtt'
  const data = fs.readFileSync('frontend/dist/frontend/assets/public/videos/' + subtitles, 'utf8')
  return data.toString()
}

function videoPath () {
  if (config.get<string>('application.promotion.video') !== null) {
    const video = utils.extractFilename(config.get<string>('application.promotion.video'))
    return 'frontend/dist/frontend/assets/public/videos/' + video
  }
  return 'frontend/dist/frontend/assets/public/videos/owasp_promo.mp4'
}
