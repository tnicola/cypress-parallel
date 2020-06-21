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

## Add a new script
 In your `package.json` add a new script:

  ```typescript
"scripts" :{
    ...
    "cy:run": "cypress run", // It can be any cypress command with any argument
    "cy:parallel" : "cypress-parallel cy:run 2"
    ...
}
 ```
# Contributors
Looking for contributors.
# License
 MIT
