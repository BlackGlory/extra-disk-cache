# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [0.12.2](https://github.com/BlackGlory/extra-disk-cache/compare/v0.12.1...v0.12.2) (2025-05-25)


### Bug Fixes

* the deletion condition about TTL ([026a1e0](https://github.com/BlackGlory/extra-disk-cache/commit/026a1e007da448e3b74dd70f1b9b04ea21f939d3))

### [0.12.1](https://github.com/BlackGlory/extra-disk-cache/compare/v0.12.0...v0.12.1) (2024-09-24)


### Bug Fixes

* __dirname ([e19dff1](https://github.com/BlackGlory/extra-disk-cache/commit/e19dff18a5c9d7db95f38d572c46daeff06f76b3))

## [0.12.0](https://github.com/BlackGlory/extra-disk-cache/compare/v0.11.2...v0.12.0) (2024-02-15)


### ⚠ BREAKING CHANGES

* - CommonJS => ESM
- Node.js v16 => Node.js v18.17.0

* upgrade dependencies ([ae44347](https://github.com/BlackGlory/extra-disk-cache/commit/ae44347800d8f42f90e1b8dd0ae099a854c781f0))

### [0.11.2](https://github.com/BlackGlory/extra-disk-cache/compare/v0.11.1...v0.11.2) (2023-06-10)


### Bug Fixes

* export src ([7638dd3](https://github.com/BlackGlory/extra-disk-cache/commit/7638dd385132945e1177f5a653c75ad0ededf276))

### [0.11.1](https://github.com/BlackGlory/extra-disk-cache/compare/v0.11.0...v0.11.1) (2022-12-21)


### Bug Fixes

* the `engines` field ([fec6f12](https://github.com/BlackGlory/extra-disk-cache/commit/fec6f128dbdf74aff70fa1c63942c8a2f2c07605))

## [0.11.0](https://github.com/BlackGlory/extra-disk-cache/compare/v0.10.1...v0.11.0) (2022-12-21)


### ⚠ BREAKING CHANGES

* - Removed `ZstandardValueConverter`
- Rewritten `ZstandardValueAsyncConverter`

* replace `@bokuweb/zstd-wasm` with `@mongodb-js/zstd` ([60e01f2](https://github.com/BlackGlory/extra-disk-cache/commit/60e01f2c995d64a8d62e5e0042908186c49601d2))

### [0.10.1](https://github.com/BlackGlory/extra-disk-cache/compare/v0.10.0...v0.10.1) (2022-12-12)


### Bug Fixes

* a edge case for memory cache ([fb81072](https://github.com/BlackGlory/extra-disk-cache/commit/fb810720e3e5e63bc3861de3b9a94465f476428e))

## [0.10.0](https://github.com/BlackGlory/extra-disk-cache/compare/v0.9.0...v0.10.0) (2022-12-11)


### ⚠ BREAKING CHANGES

* Rewritten

### Features

* rewrite ([b852f97](https://github.com/BlackGlory/extra-disk-cache/commit/b852f977b534abeed02756d3071bddaa3fa6c5fa))

## [0.9.0](https://github.com/BlackGlory/extra-disk-cache/compare/v0.8.23...v0.9.0) (2022-12-10)


### ⚠ BREAKING CHANGES

* - The database schema has been rewritten.
- The return value of `get` methods have changed.
* - The signature of `DiskCache#set` changed.
- The signature of `DiskCacheView#set` changed.
- The signature of `DiskCacheAsyncView#set` changed.

### Features

* add `DiskCacheWithCache` ([b0abd64](https://github.com/BlackGlory/extra-disk-cache/commit/b0abd64df3070548e6b1e958068b6eaf15d6080b))


### Bug Fixes

* edge cases ([0b6524c](https://github.com/BlackGlory/extra-disk-cache/commit/0b6524c13ec72b4e4db13e64657e841f982cc2c3))


* improve schema ([3f1aa4d](https://github.com/BlackGlory/extra-disk-cache/commit/3f1aa4d4c54a353524b0a8ccc0c9c2aaabb451ed))
* remove the parameter `updatedAt` of `set` and improve the cache expiration ([011e917](https://github.com/BlackGlory/extra-disk-cache/commit/011e917c4ba79187289a04c22cbc98c228d536c6))

### [0.8.23](https://github.com/BlackGlory/extra-disk-cache/compare/v0.8.22...v0.8.23) (2022-12-05)


### Bug Fixes

* keys ([d1d0718](https://github.com/BlackGlory/extra-disk-cache/commit/d1d0718601745188641bb3e4b8541e86f1b8cf93))

### [0.8.22](https://github.com/BlackGlory/extra-disk-cache/compare/v0.8.21...v0.8.22) (2022-12-05)


### Features

* add `PrefixKeyConverter`, `PrefixKeyAsyncConverter` ([60c1d98](https://github.com/BlackGlory/extra-disk-cache/commit/60c1d98946c765e6acd5c5ee16a2c076ae18b823))

### [0.8.21](https://github.com/BlackGlory/extra-disk-cache/compare/v0.8.20...v0.8.21) (2022-12-01)


### Bug Fixes

* edge cases for `keys()` ([af282aa](https://github.com/BlackGlory/extra-disk-cache/commit/af282aa303014aee054ae1d6cd4b4e406a76b587))

### [0.8.20](https://github.com/BlackGlory/extra-disk-cache/compare/v0.8.19...v0.8.20) (2022-12-01)


### Features

* add `LZ4ValueAsyncConverter`, `ZstandardValueAsyncConverter` ([c05554f](https://github.com/BlackGlory/extra-disk-cache/commit/c05554fcb5039cd40e9a532bcbe84526c8683573))

### [0.8.19](https://github.com/BlackGlory/extra-disk-cache/compare/v0.8.18...v0.8.19) (2022-12-01)


### Features

* add `DiskCacheAsyncView`, `JSONKeyConverter`, `PassthroughValueConverter` ([1cd47fc](https://github.com/BlackGlory/extra-disk-cache/commit/1cd47fc509beed1a822b52e4e1f235489a54cdb1))

### [0.8.18](https://github.com/BlackGlory/extra-disk-cache/compare/v0.8.17...v0.8.18) (2022-11-30)


### Bug Fixes

* ts-patch ([4a0e662](https://github.com/BlackGlory/extra-disk-cache/commit/4a0e662c0af7132cef2e04ce4640a9676e3aa57f))

### [0.8.17](https://github.com/BlackGlory/extra-disk-cache/compare/v0.8.16...v0.8.17) (2022-11-28)

### [0.8.16](https://github.com/BlackGlory/extra-disk-cache/compare/v0.8.15...v0.8.16) (2022-11-27)

### [0.8.15](https://github.com/BlackGlory/extra-disk-cache/compare/v0.8.14...v0.8.15) (2022-11-27)

### [0.8.14](https://github.com/BlackGlory/extra-disk-cache/compare/v0.8.13...v0.8.14) (2022-11-27)


### Features

* add `LZ4ValueConverter`, `ZstandardValueConverter` ([28d1d5a](https://github.com/BlackGlory/extra-disk-cache/commit/28d1d5adebde2aed2749c6789ca59c7c4771d968))

### [0.8.13](https://github.com/BlackGlory/extra-disk-cache/compare/v0.8.12...v0.8.13) (2022-11-27)


### Bug Fixes

* close ([3641cf6](https://github.com/BlackGlory/extra-disk-cache/commit/3641cf6199623c313c2b61c5c2b0085784eddede))

### [0.8.12](https://github.com/BlackGlory/extra-disk-cache/compare/v0.8.11...v0.8.12) (2022-11-27)


### Features

* add `IndexKeyConverter` ([3e2b8a1](https://github.com/BlackGlory/extra-disk-cache/commit/3e2b8a122805a29f352244f004eebf1d8539b700))
* add `MessagePackValueConverter` ([689d64e](https://github.com/BlackGlory/extra-disk-cache/commit/689d64efbb03b1cb8466e0d0da88a2f58f4dc2a8))

### [0.8.11](https://github.com/BlackGlory/extra-disk-cache/compare/v0.8.10...v0.8.11) (2022-11-25)


### Bug Fixes

* cancelClearTask ([0639da9](https://github.com/BlackGlory/extra-disk-cache/commit/0639da9523e5bfddf1e2661f8a8300523fc009ea))

### [0.8.10](https://github.com/BlackGlory/extra-disk-cache/compare/v0.8.9...v0.8.10) (2022-11-25)


### Features

* add `PassthroughKeyConverter` ([ee7dab3](https://github.com/BlackGlory/extra-disk-cache/commit/ee7dab32246eb30c8f578689c05575a92d3d314b))

### [0.8.9](https://github.com/BlackGlory/extra-disk-cache/compare/v0.8.8...v0.8.9) (2022-11-25)


### Features

* add `JSONValueConverter` ([17da9e4](https://github.com/BlackGlory/extra-disk-cache/commit/17da9e415e2702c1a21528939e04efff651f7c44))

### [0.8.8](https://github.com/BlackGlory/extra-disk-cache/compare/v0.8.7...v0.8.8) (2022-11-25)


### Features

* add `clear` for `DiskCacheView` ([85427ef](https://github.com/BlackGlory/extra-disk-cache/commit/85427efe5bd0bcfd39828afb491ab4892fa3b5f0))

### [0.8.7](https://github.com/BlackGlory/extra-disk-cache/compare/v0.8.6...v0.8.7) (2022-11-23)

### [0.8.6](https://github.com/BlackGlory/extra-disk-cache/compare/v0.8.5...v0.8.6) (2022-11-23)

### [0.8.5](https://github.com/BlackGlory/extra-disk-cache/compare/v0.8.4...v0.8.5) (2022-11-23)

### [0.8.4](https://github.com/BlackGlory/extra-disk-cache/compare/v0.8.3...v0.8.4) (2022-08-11)

### [0.8.3](https://github.com/BlackGlory/extra-disk-cache/compare/v0.8.2...v0.8.3) (2022-08-11)


### Bug Fixes

* lazy ([aae1240](https://github.com/BlackGlory/extra-disk-cache/commit/aae12404dbef69817fcf877eedcabdd8ee2bdc8c))

### [0.8.2](https://github.com/BlackGlory/extra-disk-cache/compare/v0.8.1...v0.8.2) (2022-08-11)

### [0.8.1](https://github.com/BlackGlory/extra-disk-cache/compare/v0.8.0...v0.8.1) (2022-08-02)

## [0.8.0](https://github.com/BlackGlory/extra-disk-cache/compare/v0.7.2...v0.8.0) (2022-08-02)


### ⚠ BREAKING CHANGES

* `DiskCache.create(dirname)` => `DiskCache.create(filename)`
```ts
filename = `${dirname}/data.db`
```

* replace dirname with filename ([2175a96](https://github.com/BlackGlory/extra-disk-cache/commit/2175a96ca12ae9923bf27c21c91e41d2d95c3855))

### [0.7.2](https://github.com/BlackGlory/extra-disk-cache/compare/v0.7.1...v0.7.2) (2022-08-01)

### [0.7.1](https://github.com/BlackGlory/extra-disk-cache/compare/v0.7.0...v0.7.1) (2022-08-01)


### Features

* add DiskCacheView ([0ed031f](https://github.com/BlackGlory/extra-disk-cache/commit/0ed031fc6ea2e5fdb7d2a4ecd128ab9ecde44e7d))

## [0.7.0](https://github.com/BlackGlory/extra-disk-cache/compare/v0.6.0...v0.7.0) (2022-07-28)


### ⚠ BREAKING CHANGES

* rewrite

### Features

* rewrite ([dc65328](https://github.com/BlackGlory/extra-disk-cache/commit/dc6532886b5e9169b1020f619ae450b8acbbcd26))

## [0.6.0](https://github.com/BlackGlory/extra-disk-cache/compare/v0.5.1...v0.6.0) (2022-05-26)


### ⚠ BREAKING CHANGES

* replace rocksdb with leveldb

### Bug Fixes

* memory leak ([ed4a1f3](https://github.com/BlackGlory/extra-disk-cache/commit/ed4a1f3169e8251712b8f8502c5d3070b164422d))

### [0.5.1](https://github.com/BlackGlory/extra-disk-cache/compare/v0.5.0...v0.5.1) (2022-04-10)


### Features

* add keysData, keysMetadata ([b9cf92e](https://github.com/BlackGlory/extra-disk-cache/commit/b9cf92e334c2d401f376a6c9acf720d1a9632f03))

## [0.5.0](https://github.com/BlackGlory/extra-disk-cache/compare/v0.4.3...v0.5.0) (2022-04-07)


### ⚠ BREAKING CHANGES

* rewrite database schema

### Features

* rewrite metadata ([c410926](https://github.com/BlackGlory/extra-disk-cache/commit/c410926d532f08dd780bff5e51a9b71df51c129b))

### [0.4.3](https://github.com/BlackGlory/extra-disk-cache/compare/v0.4.2...v0.4.3) (2022-03-20)

### [0.4.2](https://github.com/BlackGlory/extra-disk-cache/compare/v0.4.1...v0.4.2) (2021-12-30)

### [0.4.1](https://github.com/BlackGlory/extra-disk-cache/compare/v0.4.0...v0.4.1) (2021-12-17)

## [0.4.0](https://github.com/BlackGlory/extra-disk-cache/compare/v0.3.3...v0.4.0) (2021-12-16)


### ⚠ BREAKING CHANGES

* - The minimum version is Node.js v16

* upgrade dependencies ([771d7b5](https://github.com/BlackGlory/extra-disk-cache/commit/771d7b5909580263982f4facc2fe7b64751c38b0))

### [0.3.3](https://github.com/BlackGlory/extra-disk-cache/compare/v0.3.2...v0.3.3) (2021-12-16)

### [0.3.2](https://github.com/BlackGlory/extra-disk-cache/compare/v0.3.1...v0.3.2) (2021-11-18)

### [0.3.1](https://github.com/BlackGlory/extra-disk-cache/compare/v0.3.0...v0.3.1) (2021-10-22)


### Bug Fixes

* include migrations ([d75eef0](https://github.com/BlackGlory/extra-disk-cache/commit/d75eef049eede53740d0f630a356c181a38d27b5))

## [0.3.0](https://github.com/BlackGlory/extra-disk-cache/compare/v0.2.1...v0.3.0) (2021-10-22)


### ⚠ BREAKING CHANGES

* the parameter timeBeforeDeletion now is required

* the parameter timeBeforeDeletion now is required ([e1846c8](https://github.com/BlackGlory/extra-disk-cache/commit/e1846c8ba0048174e4035fa51867ed61f4fde386))

### [0.2.1](https://github.com/BlackGlory/extra-disk-cache/compare/v0.2.0...v0.2.1) (2021-10-17)

## [0.2.0](https://github.com/BlackGlory/extra-disk-cache/compare/v0.1.1...v0.2.0) (2021-10-17)


### ⚠ BREAKING CHANGES

* remove the constructor of DiskCache

* remove async-constructor ([70ea430](https://github.com/BlackGlory/extra-disk-cache/commit/70ea430cb579413f7e9b6d536d0615ea35b4484f))

### [0.1.1](https://github.com/BlackGlory/extra-disk-cache/compare/v0.1.0...v0.1.1) (2021-10-08)

## 0.1.0 (2021-09-22)


### Features

* init ([2c90204](https://github.com/BlackGlory/extra-disk-cache/commit/2c902048770c99e6ab8b03cc49420d45b624de41))
