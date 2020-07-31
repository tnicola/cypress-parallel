[![npm version](https://badge.fury.io/js/cypress-parallel.svg)](https://badge.fury.io/js/cypress-parallel)
# cypress-parallel
Reduce up to 40% your Cypress suite execution time parallelizing the test run on the same machine.
 
# Run your Cypress test in parallel (locally)

## How it works
🔍 - Search for existing Cypress tests\
📄 - Read (if exists) a weight file\
⚖️ - Split spec files into different threads\
⚙️ - For each thread it runs the Cypress command you've passed as argument\
📈 - Wait for all threads to finish and collects the result in a single report

# How to use

## Install
 ```
 npm i cypress-parallel
 ```

 or 

```
yarn add cypress-parallel
 ```

## Add a new script
 In your `package.json` add a new script:

  ```typescript
"scripts" :{
    ...
    "cy:run": "cypress run", // It can be any cypress command with any argument
    "cy:parallel" : "cypress-parallel -s cy:run -t 2 -d <your-cypress-specs-folder> -a '\"<your-cypress-cmd-args>\"'"
    ...
}
 ```

### With Arguments

Sample:

```
-a '\"--config baseUrl=http://localhost:3000\"'
```

## Launch the new script

```
npm run cy:parallel
```

### Scripts options

| Option     | Alias | Description                        | Type   |
| ---------- | ----- | ---------------------------------- | ------ |
| --help     |       | Show help                          |        |
| --version  |       | Show version number                |        |
| --script   | -s    | Your npm Cypress command           | string |
| --args     | -a    | Your npm Cypress command arguments | string |
| --threads  | -t    | Number of threads                  | number |
| --specsDir | -d    | Cypress specs directory.           | string |

# Contributors
Looking for contributors.
# License
 MIT
