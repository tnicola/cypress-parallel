const path = require('path');

const settings = JSON.parse(process.env.CY_PARALLEL_SETTINGS);

const resultsPath = path.join(process.cwd(), settings.resultsDirPath);

module.exports = {
  resultsPath
};
