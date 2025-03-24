
# json-schema-md-doc
## Generate markdown documentation for JSON Schemas
Try it out at [brianwendt.github.io/json-schema-md-doc](https://brianwendt.github.io/json-schema-md-doc)

[Click here](https://github.com/BrianWendt/json-schema-md-doc/tree/master/samples/node) to see the Node example.

**NOTE:** JSONSchemaMarkdownDoc.js supports [json-schema.org](https://json-schema.org/) `draft-7`. Previous drafts may not generate documentation correctly.

## This project has moved!
The codebase has been migrated to [github.com/OntoDevelopment/json-schema-doc-ts](https://github.com/OntoDevelopment/json-schema-doc-ts)
This repository implements that module and uses webpack to create a es2015 compatible minified JavaScript file. The browser tool and samples are kept in this repo to keep the module's repo lean. 

## es6/Node Implementation
**NPM Project**
```
npm install json-schema-doc-ts
```

```javascript
import { JSONSchemaMarkdownDoc } from "json-schema-doc-ts";
```
or
**HTML**
``` html
<script src="https://brianwendt.github.io/json-schema-md-doc/json-schema-md-doc.min.js"></script>
```
**Javascript**
``` javascript
// simple schema for the example
const colors_schema = {
	"description": "Choose a color",
	"type": "string",
	"enum": ["red", "amber", "green"]
}

// create an instance of JSONSchemaMarkdownDoc and load the schema
const Doccer = new JSONSchemaMarkdownDoc(colors_schema);
// generate the markdown
console.log(Doccer.generate());
```
**Result**
``` markdown
_Choose a color_

Type: `string`

*path: #*

The value is restricted to the following: 

 1. *"red"*
 2. *"amber"*
 3. *"green"*

*Generated with [json-schema-md-doc](https://brianwendt.github.io/json-schema-md-doc/)*
```

## Extendabale in es2015 (browser)
You may easily extend `JSONSchemaMarkdownDoc` from `json-schema-md-doc.min.js` to customize the formatting of your markdown by overriding any method.
``` javascript
class MyDoccer extends JSONSchemaMarkdownDoc {
    constructor(){
        super();
        this.footer = "Thanks for reading the documentation!";
    }
    valueBool(bool) {
        if (typeof bool === "string") {
            return bool;
        } else {
            return (bool) ? "TRUE" : "FALSE"; //uppercase instead of true/false
        }
    }
};
```
