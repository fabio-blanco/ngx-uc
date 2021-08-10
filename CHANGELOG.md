# Changelog
All notable changes to this project will be documented in this file.

**Unreleased** section is about things that are been worked on or are just plans. They may or may 
not become part of a release, but they probably will.

**Initial Alpha Releases** section is about pre-releases. All releases listed here are not really 
official releases, but they will have a package that can be downloaded to be used at your own risk. 
They are not expected to be stable and breaking changes can happen from one alpha release to another. 
All the initial alpha releases will have the major version 0 (0.x.x) despite any breaking changes.
After the first official release, this section will be deprecated and the semantic versioning will be
stabilized.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Unit tests

### Fixed
 
- Zoom result background not initialized when image is not fully loaded
- Unwrap the image and unregister the listeners on ngDestroy to avoid memory leaks

### Changed

- uc-zoom component renamed to uc-zoom-view to be more descriptive and allow the creation of a 
future, and more specialized, new uc-zoom component.
- Removed id from native elements created by the component.

## [Initial Alpha Releases]

### [0.0.1] - 2021-08-03

- The starting bootstrap point of the project


[Unreleased]: https://github.com/fabio-blanco/ngx-uc/compare/0.0.1...HEAD
[Initial Alpha Releases]: https://github.com/fabio-blanco/ngx-uc/compare/0.0.1...HEAD
[0.0.1]: https://github.com/fabio-blanco/ngx-uc/releases/tag/0.0.1
