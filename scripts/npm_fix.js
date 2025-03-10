const fs = require('fs');

var ignore = fs.readFileSync('./.gitignore');
ignore += "\n";
ignore += "# npm ignore\n";
ignore += "docs/";
fs.writeFileSync('./.npmignore', ignore);