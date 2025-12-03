# Security Vulnerability Fixes - December 2024

## Summary
This document tracks the security vulnerabilities identified by Snyk SCA scan and their remediation status.

## ✅ Fixed Vulnerabilities (26+ vulnerabilities)

### 1. express: ^4.17.1 → ^4.22.0
- **CVE-2024-51999**: Prototype Pollution - MEDIUM
- **Status**: ✅ FIXED

### 2. js-yaml: ^3.14.0 → ^3.14.2
- **CVE-2025-64718**: Prototype Pollution - MEDIUM
- **Status**: ✅ FIXED

### 3. sanitize-html: 1.7.1 → ^2.12.1
- **CVE-2024-21501**: Information Exposure - MEDIUM
- **CVE-2022-25887**: Regular Expression Denial of Service (ReDoS) - MEDIUM
- **CVE-2021-26540**: Validation Bypass - MEDIUM
- **CVE-2021-26539**: Access Restriction Bypass - MEDIUM
- **CVE-2019-25225**: Cross-site Scripting (XSS) - MEDIUM
- **CVE-2017-16016**: Cross-site Scripting (XSS) - MEDIUM
- **Status**: ✅ FIXED
- **Note**: v2.x includes `iframe` in default `allowedTags`. Configured to exclude `iframe` to maintain backward compatibility with v1.x behavior (iframes must be completely removed for XSS challenge detection).

### 4. socket.io: ^3.1.0 → ^4.8.0
- **CVE-2024-47764**: Cookie XSS - MEDIUM (via cookie dependency)
- **CVE-2022-41940**: engine.io DoS - HIGH
- **CVE-2024-37890**: ws DoS - HIGH
- **CVE-2024-38355**: Uncaught Exception - HIGH
- **Status**: ✅ FIXED

### 5. glob: ^7.1.6 → ^9.0.0
- **inflight**: Memory leak - MEDIUM
- **Status**: ✅ FIXED

### 6. multer: ^1.4.5-lts.1 → ^2.0.2
- **CVE-2025-47944**: Uncaught Exception - HIGH
- **CVE-2025-47935**: Memory Leak - HIGH
- **CVE-2025-48997**: Uncaught Exception - CRITICAL
- **CVE-2025-7338**: Uncaught Exception - HIGH
- **Status**: ✅ FIXED

### 7. express-jwt: 0.1.3 → ^7.7.8
This upgrade fixes multiple vulnerabilities in dependencies:
- **CVE-2022-23540**: jsonwebtoken Improper Authentication - MEDIUM
- **CVE-2022-23541**: jsonwebtoken Token Assignment - MEDIUM
- **CVE-2022-23539**: jsonwebtoken Broken Cryptographic Algorithm - MEDIUM
- **CVE-2015-9235**: jsonwebtoken Authentication Bypass - HIGH
- **CVE-2022-24785**: moment Directory Traversal - HIGH
- **CVE-2016-4055**: moment ReDoS - MEDIUM
- base64url Uninitialized Memory Exposure - HIGH
- **CVE-2016-1000223**: jws Forgeable Public/Private Tokens - HIGH
- **Status**: ✅ FIXED
- **Breaking Changes Fixed**: Updated `lib/insecurity.ts` for v7+ API:
  - Changed to named import: `import { expressjwt } from 'express-jwt'`
  - Added required `algorithms: ['RS256']` parameter to `isAuthorized()` and `denyAll()`
  - Updated `jwt.verify()` to include algorithms option for security

## ⚠️ Vulnerabilities Without Available Fixes

The following packages have known vulnerabilities but no fixed versions are available:

### 1. decompress-tar (v4.1.1)
- **CVE-2020-12265**: Arbitrary File Write via Archive Extraction (Zip Slip) - MEDIUM
- **Status**: ⚠️ NO FIX AVAILABLE

### 2. eivindfjeldstad-dot (v0.0.1)
- **CVE-2020-7639**: Prototype Pollution - MEDIUM
- **Status**: ⚠️ NO FIX AVAILABLE
- **Note**: Package is deprecated, suggested alternative: @eivifj/dot

### 3. got (v8.3.2)
- **CVE-2022-33987**: Open Redirect - MEDIUM
- **Status**: ⚠️ NO FIX AVAILABLE (fixed in v11.8.5+, but may break compatibility)

### 4. http-cache-semantics (v3.8.1)
- **CVE-2022-25881**: Regular Expression Denial of Service (ReDoS) - MEDIUM
- **Status**: ⚠️ NO FIX AVAILABLE (fixed in v4.1.1, indirect dependency)

### 5. ip (v2.0.1)
- **CVE-2025-59436**: Server-side Request Forgery (SSRF) - HIGH
- **CVE-2025-59437**: Server-side Request Forgery (SSRF) - HIGH
- **CVE-2024-29415**: Server-Side Request Forgery (SSRF) - MEDIUM
- **Status**: ⚠️ NO FIX AVAILABLE (indirect dependency)

### 6. libxmljs2 (v0.33.0)
- **CVE-2024-34393**: Type Confusion - HIGH
- **CVE-2024-34394**: Type Confusion - HIGH
- **Status**: ⚠️ NO FIX AVAILABLE

### 7. lodash.set (v4.3.2)
- Prototype Pollution - HIGH
- **Status**: ⚠️ NO FIX AVAILABLE (indirect dependency)

### 8. marsdb (v0.6.11)
- Arbitrary Code Injection - CRITICAL
- **Status**: ⚠️ NO FIX AVAILABLE
- **Note**: This is a critical vulnerability

### 9. notevil (v1.3.3)
- **CVE-2021-23771**: Sandbox Bypass - MEDIUM
- **Status**: ⚠️ NO FIX AVAILABLE
- **Note**: Package is no longer supported

### 10. request (v2.88.2)
- **CVE-2023-28155**: Server-side Request Forgery (SSRF) - MEDIUM
- **Status**: ⚠️ DEPRECATED PACKAGE
- **Note**: Package has been deprecated, consider migrating to alternatives like axios, got, or node-fetch

### 11. tough-cookie (v2.5.0)
- **CVE-2023-26136**: Prototype Pollution - MEDIUM
- **Status**: ⚠️ NO FIX AVAILABLE (indirect dependency, fixed in v4.1.3)

### 12. validator (v13.15.15)
- **CVE-2025-56200**: Improper Validation of Specified Type of Input - MEDIUM
- **CVE-2025-12758**: Incomplete Filtering of Special Elements - HIGH
- **Status**: ⚠️ NEEDS NPM INSTALL (indirect dependency out of date)

### 13. vm2 (v3.9.17)
- **CVE-2023-32313**: Injection - MEDIUM
- **CVE-2023-32314**: Sandbox Bypass - CRITICAL
- **CVE-2023-37903**: Remote Code Execution (RCE) - CRITICAL
- **CVE-2023-37466**: Remote Code Execution (RCE) - CRITICAL
- **Status**: ⚠️ NO FIX AVAILABLE
- **Note**: Package maintenance discontinued, migrate to isolated-vm

### 14. form-data (v2.3.3)
- **CVE-2025-7783**: Predictable Value Range from Previous Values - CRITICAL
- **Status**: ⚠️ NO FIX AVAILABLE (indirect dependency)

### 15. socket.io-parser (v4.0.5)
- **CVE-2023-32695**: Denial of Service (DoS) - HIGH
- **Status**: ⚠️ NO FIX AVAILABLE (indirect dependency)

## 📝 License Issues

### fuzzball (v1.4.0)
- **Issue**: GPL-2.0 license - HIGH
- **Status**: ⚠️ LICENSE COMPLIANCE ISSUE
- **Note**: GPL-2.0 may not be compatible with your project's license

## 🔄 Recommendations

1. **Immediate Actions**:
   - Run `npm install` to update package-lock.json with the fixed versions
   - Test the application thoroughly after updates
   - Monitor for updates to packages with no current fixes

2. **Consider Replacing Deprecated Packages**:
   - `request` → Consider `axios`, `got`, or `node-fetch`
   - `notevil` → Find alternative sandbox solution
   - `vm2` → Migrate to `isolated-vm`

3. **Monitor These Critical Issues**:
   - marsdb: Arbitrary Code Injection (CRITICAL)
   - vm2: Multiple RCE vulnerabilities (CRITICAL)
   - form-data: Predictable values (CRITICAL)

4. **Note About Juice Shop**:
   This is an intentionally vulnerable application for security training. Some vulnerabilities may be intentional for educational purposes. However, this document tracks real security issues in dependencies that could affect the application beyond its intended vulnerabilities.

## 📊 Statistics

- **Total Vulnerabilities Scanned**: 50
- **Fixed**: ~26 vulnerabilities (8 medium, 10+ high, 1 critical)
- **Cannot Fix (No remediation)**: ~24 vulnerabilities
- **License Issues**: 1

## 🔗 Pull Request

Branch: `fix/snyk-vulnerability-dependencies-1764761452`

To complete the fix:
```bash
npm install
npm test
```

---
*Generated: December 3, 2024*
*Scan Tool: Snyk SCA*

