

# cli-cypress-parallel

Reduce your Cypress test execution time parallelizing the test runs on the same machine.

forked from [cypress-parallel] 

# Run your Cypress tests in parallel (locally)

Executes Cypress programatically in multiple threads using Promise.all and the [Cypress module api](https://docs.cypress.io/guides/guides/module-api)
Collates the results in memory for easy reporting.
It will record the time-based "weight" of each test file into a local json, and optionally uses that to evenly distribute the test files for better thread balance in future test executions.
Includes a simple spec reporter, but can be used with any reporter that works in parallel execution such as mochawesome.

## Install and run

checkout locally

```
chmod +x ./cypress_parallel/cypress-parallel.js
sudo npm link
```
### run cypress tests in this repo

by default runs with 2 threads using the glob pattern "test/cypress/integration/\*\*/\*\*"

```
npm run cy:parallel:test
```
currently using cypress v9.7.0, but I have tested with the latest version 12.9.0 and confirmed that also works, although it seems to not perform as well as v.9.7.0.

### With Custom Arguments

```
npx cypress-parallel -t 4 --browser electron -d "cypress/integration/myfolder/**"
```

#### Arguments

| Arguments         | Alias | Description                        | Type   |
| ----------------- | ----- | ---------------------------------- | ------ |
| --help            |       | Show help                          |        |
| --version         |       | Show version number                |        |
| --threads         | -t    | Number of threads                  | number |
| --specsDir        | -d    | Cypress specs directory            | string |
| --weightsJson     | -w    | Parallel weights json file         | string |
| --reporter        | -r    | reporter name                      | string |
| --reporterOptions | -o    | Reporter options config file name  | string |
| --verbose         | -v    | Some additional logging            | string |
| --strictMode      | -m    | Add stricter checks after running the tests | boolean |
| --dry             | -y    | shows files and threads. does not execute tests | boolean |
| --configFile      |       | path to a cypress config file | string | 
| --headless        |       | if true then headless execution | boolean |
| --browser         |       | which browser to use. chrome, electron, etc | string |

## Env variables

### CYPRESS_THREAD

You can get the current thread index by reading the `CYPRESS_THREAD` variable.

```javascript
 const threadIndex = process.env.CYPRESS_THREAD;
 // return 1, 2, 3, 4, ...
```

This project is licensed under the MIT license. See [LICENSE](LICENSE).
