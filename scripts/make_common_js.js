const fs = require('fs');

const dir = './docs/lib/';
const path = './docs/lib/JSONSchemaMarkdownDoc.js';

let content = fs.readFileSync(dir + 'JSONSchemaMarkdownDoc.js');
content = content.toString().replace('export default', '// export default');

fs.writeFileSync(dir + 'common.js', content);