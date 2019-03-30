# Changelog

The format: [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)

## [Unreleased]

- Fix for #27, `describe` is no longer incorrectly an async function

## [1.4.1][] - 2019-03-29

- Can now assign type generics to IGherkinTableParam (alias: ITable) methods.
  - eg. `const products = table.rows.mapByTop<IProduct>();`

## [1.3.1][] - 2018-11-29

- Readme fixes

## [1.3.0][] - 2018-11-29

- Scenario steps now support `.skip` and the omission of the step fn:
  - `Scenario('foo').Then.skip('wew', myFn)` Skipped
  - `Scenario('foo').Then.skip('wew')` Skipped
  - `Scenario('foo').Then('wew')` Skipped
  - `Scenario('foo').Then('wew', myFn)` Not skipped!

- Scenario steps which error will no longer execute following steps
  - They will appear as a pass in Jest, but they are actually just skipped

- Steps are now prefixed with their step type name
- README refactor. Should be much better documented.

## [1.2.0][] - 2018-11-12

- Added browser support

## [1.1.0][] - 2018-11-02

### Added

- Can now `Scenario.only(`, in order to only run that scenario.

### Removed

- `Background.skip` removed as it is not viable, as backgrounds skipped based on scenarios

## [1.0.1][] - 2018-10-16

- Misc changes

## [1.0.0][] - 2018-10-11

- Upgrade dependencies
- Add static methods `skip` to `Scenario`, `Background` and `ScenarioOutline`
  - eg. `Scenario.skip('My scenario').Then( ...`
  - Works just like in jest & mocha

## [0.9.1-beta][] - 2018-07-26

- Fixes for previous type constraints

## [0.9.0-beta][] - 2018-07-26

- Enabled types to be constrained and auto-inferred between steps

## [0.8.0-beta][] - 2018-07-23

- Fix Background state issues

## [0.7.1-beta][] - 2018-07-23

- Fix issue from last feature

## [0.7.0-beta][] - 2018-07-22

- Add in `{ timeout?: number }` as an optional parameter to all step functions
- Add `Feature({ defaultTimeout?: number })` config option

## [0.6.2-beta][] - 2018-07-19

- Fix for ScenarioOutlines being required always due to use of configuration resolver

## [0.6.1-beta][] - 2018-07-19

- Fix a type check allowing for single string param Feature's

## [0.6.0-beta][] - 2018-07-16

- Support polymorphic input to `Feature`

## [0.5.0-beta][] - 2018-07-16

- Add export `Feature` as alias to `GherkinTest`

## [0.4.1-beta][] - 2018-07-16

- Release cleanup

## [0.4.0-beta][] - 2018-07-16

- Add in hooks

## [0.3.0-alpha][] - 2018-06-25

- Stupid `yarn release` fix
- Add a build script to publish with
- Add TS declarations

## [0.2.4-alpha][] - 2018-06-24

- Package no longer private. Releasing.

## [0.2.3-alpha][] - 2018-06-24

- CI Stuff

## [0.2.2-alpha][] - 2018-06-24

- CI Stuff

## [0.2.1-alpha][] - 2018-06-24

- Misc fixes

## [0.2.0-alpha][] - 2018-06-24

- Export things from the index
- General tidy up
- Tidy up readme

## [0.1.0][] - 2018-06-24

- Init


[Unreleased]: https://github.com/nfour/fermenter/compare/v1.4.1...HEAD
[1.4.1]: https://github.com/nfour/fermenter/compare/v1.4.0...v1.4.1
[1.4.0]: https://github.com/nfour/fermenter/compare/v1.3.1...v1.4.0
[1.3.1]: https://github.com/nfour/fermenter/compare/v1.3.0...v1.3.1
[1.3.0]: https://github.com/nfour/fermenter/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/nfour/fermenter/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/nfour/fermenter/compare/v1.0.1...v1.1.0
[1.0.1]: https://github.com/nfour/fermenter/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/nfour/fermenter/compare/v0.9.1-beta...v1.0.0
[0.9.1-beta]: https://github.com/nfour/fermenter/compare/v0.9.0-beta...v0.9.1-beta
[0.9.0-beta]: https://github.com/nfour/fermenter/compare/v0.8.0-beta...v0.9.0-beta
[0.8.0-beta]: https://github.com/nfour/fermenter/compare/v0.7.1-beta...v0.8.0-beta
[0.7.1-beta]: https://github.com/nfour/fermenter/compare/v0.7.0-beta...v0.7.1-beta
[0.7.0-beta]: https://github.com/nfour/fermenter/compare/v0.6.2-beta...v0.7.0-beta
[0.6.2-beta]: https://github.com/nfour/fermenter/compare/v0.6.1-beta...v0.6.2-beta
[0.6.1-beta]: https://github.com/nfour/fermenter/compare/v0.6.0...v0.6.1-beta
[0.6.0]: https://github.com/nfour/fermenter/compare/v0.6.0-beta...v0.6.0
[0.6.0-beta]: https://github.com/nfour/fermenter/compare/v0.5.0-beta...v0.6.0-beta
[0.5.0-beta]: https://github.com/nfour/fermenter/compare/v0.4.1-beta...v0.5.0-beta
[0.4.1-beta]: https://github.com/nfour/fermenter/compare/v0.4.0-beta...v0.4.1-beta
[0.4.0-beta]: https://github.com/nfour/fermenter/compare/v0.3.0-alpha...v0.4.0-beta
[0.3.0-alpha]: https://github.com/nfour/fermenter/compare/v0.2.4-alpha...v0.3.0-alpha
[0.2.4-alpha]: https://github.com/nfour/fermenter/compare/v0.2.3-alpha...v0.2.4-alpha
[0.2.3-alpha]: https://github.com/nfour/fermenter/compare/v0.2.2-alpha...v0.2.3-alpha
[0.2.2-alpha]: https://github.com/nfour/fermenter/compare/v0.2.1-alpha...v0.2.2-alpha
[0.2.1-alpha]: https://github.com/nfour/fermenter/compare/v0.2.0-alpha...v0.2.1-alpha
[0.2.0-alpha]: https://github.com/nfour/fermenter/compare/v0.1.0...v0.2.0-alpha
[0.1.0]: https://github.com/nfour/fermenter/tree/v0.1.0
