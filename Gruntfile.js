/*
 * Copyright (c) 2014-2023 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

'use strict'

module.exports = function (grunt) {
  const os = grunt.option('os') || process.env.PCKG_OS_NAME || ''
  const platform = grunt.option('platform') || process.env.PCKG_CPU_ARCH || ''
  const node = grunt.option('node') || process.env.nodejs_version || process.env.PCKG_NODE_VERSION || ''

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    compress: {
      pckg: {
        options: {
          mode: os === 'linux' ? 'tgz' : 'zip',
          archive: 'dist/<%= pkg.name %>-<%= pkg.version %>' + (node ? ('_node' + node) : '') + (os ? ('_' + os) : '') + (platform ? ('_' + platform) : '') + (os === 'linux' ? '.tgz' : '.zip')
        },
        files: [
          {
            src: [
              'LICENSE',
              '*.md',
              'package.json',
              'ctf.key',
              'swagger.yml',
              'server.ts',
              'config.schema.yml',
              'build/**',
              '!build/reports/**',
              'bom.json',
              'bom.xml',
              'config/*.yml',
              'data/*.ts',
              'data/static/**',
              'data/chatbot/.gitkeep',
              'encryptionkeys/**',
              'frontend/dist/frontend/**',
              'frontend/dist/bom/**',
              'frontend/src/**/*.ts',
              'ftp/**',
              'i18n/.gitkeep',
              'lib/**',
              'models/*.ts',
              'node_modules/**',
              'routes/*.ts',
              'uploads/complaints/.gitkeep',
              'views/**'
            ],
            dest: 'juice-shop_<%= pkg.version %>/'
          }
        ]
      }
    }
  })

  // Custom task to update package.json using jsonfile
  grunt.registerTask('update_package_json', 'Update package.json fields safely', function () {
    const jsonfile = require('jsonfile')
    const pkgPath = 'package.json'
    const pkg = jsonfile.readFileSync(pkgPath)
    pkg.engines = pkg.engines || {}
    pkg.engines.node = node || pkg.engines.node
    pkg.os = os ? [os] : pkg.os
    pkg.cpu = platform ? [platform] : pkg.cpu
    jsonfile.writeFileSync(pkgPath, pkg, { spaces: 2 })
    grunt.log.writeln('package.json updated safely.')
  })

  grunt.registerTask('checksum', 'Create .md5 checksum files', function () {
    const fs = require('fs')
    const crypto = require('crypto')
    fs.readdirSync('dist/').forEach(file => {
      const buffer = fs.readFileSync('dist/' + file)
      const md5 = crypto.createHash('md5')
      md5.update(buffer)
      const md5Hash = md5.digest('hex')
      const md5FileName = 'dist/' + file + '.md5'
      grunt.file.write(md5FileName, md5Hash)
      grunt.log.write(`Checksum ${md5Hash} written to file ${md5FileName}.`).verbose.write('...').ok()
      grunt.log.writeln()
    })
  })

  grunt.loadNpmTasks('grunt-contrib-compress')
  grunt.registerTask('package', ['update_package_json', 'compress:pckg', 'checksum'])
}
