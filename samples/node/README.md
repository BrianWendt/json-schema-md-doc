# Implementing and Extending in Node
Files
 - [doc.js](./doc.js) - complete, working script
 - [schema.json](../schema.json) - input
 - [schema.md](./schema.md) - output
## NPM Install
``` shell
npm i json-schema-md-doc
```

## Load the Module
First we're going to require a the `JSONSchemaMarkdownDoc` module and the File System (`fs`) module; We'll also load in the `package.json` file for use later.
``` javascript
const {JSONSchemaMarkdownDoc} = require('json-schema-md-doc');
const fs = require("fs");
const package = require("../../package.json");
```
## Extend
We're going to make a new class that extends the `JSONSchemaMarkdownDoc` class.
``` javascript
class MyDoccer extends JSONSchemaMarkdownDoc {
    constructor(){
        super();
        this.footer += " _" + (new Date()) + "_";
    }
};
```
For this example we're just going to simply append a timestamp to the footer.
## Generate Documentation Markdown
Instantiate your new class.
``` javascript
const Doccer = new MyDoccer();
```
Get the JSON Schema file and load it.
``` javascript
var json = require('./schema.json');
```
You can change some properties at this point.
``` javascript
json['$comment'] = 'version ' + package.version;
```
Load the JSON Schema into the instance and then generate the markdown.
``` javascript
Doccer.load(json);
Doccer.generate();
```
`Doccer.markdown` now contains the completed documentation.

So now we'll save it to `schema.md` (after checking for errors).
``` javascript
if(Doccer.errors.length > 0){
    console.log('errors', Doccer.errors);
} else {
    fs.writeFile('./schema.md', Doccer.markdown, function(err){
        console.log(err || "No errors writing schema.md");
    });
}
```