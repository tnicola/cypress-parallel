# cypress-parallel
Reduce up to 40% your Cypress suite execution time parallelizing the test run on the same machine.
 
 # Run your Cypress test in parallel

 ## Features
 - Automatically detects your Cypress test suite
 - Automatically splits tests based on previous tests duration in order to have balanced subsets
 - Runs the test suite in different threads
 - Colllects all the results

 # How to use

 ## Install
 ```
 npm i cypress-parallel
 ```

 ## Add a new script
 In your `package.json` add a new script:

  ```json
"scripts" :{
    ...
    "cy:run": "cypress run", // It can be any cypress command with any argument
    "cy:parallel" : "cypress-parallel cy:run 2"
    ...
}
 ```

 # License
 MIT
