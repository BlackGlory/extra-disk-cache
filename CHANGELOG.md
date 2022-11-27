# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

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
