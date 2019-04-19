# json-schema-md-doc
## Generate markdown documentation for JSON Schemas
Try it out at [brianwendt.github.io/json-schema-md-doc](https://brianwendt.github.io/json-schema-md-doc)

Download [JSONSchemaMarkdown.js](https://raw.githubusercontent.com/BrianWendt/json-schema-md-doc/master/docs/lib/JSONSchemaMarkdown.js)

[Click here](https://github.com/BrianWendt/json-schema-md-doc/tree/master/samples/node) to see the Node example.

**NOTE:** JSONSchemaMarkdown.js supports [json-schema.org](https://json-schema.org/) `draft-7`. Previous drafts may not generate documentation correctly.

## Extendabale
You may easily extend `JSONSchemaMarkdown.js` to customize the formatting of your markdown by overriding any method.
``` javascript
class MyDoccer extends JSONSchemaMarkdown {
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
