# Implementing and Extending in Node
Files
 - [doc.js](./doc.js) - complete, working script
 - [schema.json](../schema.json) - input
 - [schema.md](./schema.md) - output
## NPM Install
``` shell
npm i json-schema-doc
```

## Load the Module
First we're going to require a the `JSONSchemaMarkdownDoc` module and the File System (`fs`) module.
``` javascript
import {JSONSchemaMarkdownDoc} from 'json-schema-doc';
import fs from 'fs';
```
## Extend
We're going to make a new class that extends the `JSONSchemaMarkdownDoc` class.
``` javascript
class MyDoccer extends JSONSchemaMarkdownDoc {
    constructor(schema){
        super(schema);
        this.footer += " _" + (new Date()) + "_";
    }
}
```
For this example we're just going to simply append a timestamp to the footer.
## Generate Documentation Markdown
Get the JSON Schema as a string
``` javascript
const schema = fs.readFileSync('./samples/node/schema.json', 'utf8');
```
Instantiate your new class with the json string.
``` javascript
const Doccer = new MyDoccer(schema);
```

Generate the markdown.
``` javascript
Doccer.generate();
```
`Doccer.response` now contains the completed documentation.

So now we'll save it to `schema.md` (after checking for errors).
``` javascript
if(Doccer.errors.length > 0){
    console.log('errors', Doccer.errors);
} else {
    fs.writeFile('./schema.md', Doccer.response, function(err){
        console.log(err || "No errors writing schema.md");
    });
}
```