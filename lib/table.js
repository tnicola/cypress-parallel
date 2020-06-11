const Table = require('cli-table');
let table = new Table({
  head: ['Spec', 'Time', 'Tests', 'Passing', 'Failing', 'Pending', 'Skipped'],
  colWidths: [20, 8, 7, 9, 9, 9, 9]
});

table.push(['dasdasdsadsd.sd', '2102ms']);

table.push(['da sdas ds adsd.sd', '2102ms']);

table.push(['dasdasdsasdsds asdsdsd.sd', '1290ms']);

console.log(table.toString());
