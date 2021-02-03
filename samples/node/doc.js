//const {JSONSchemaMarkdown} = require('json-schema-md-doc');
const {JSONSchemaMarkdown} = require('../../docs/lib/JSONSchemaMarkdown');
const fs = require("fs");
const package = require("../../package.json");

class MyDoccer extends JSONSchemaMarkdown {
    constructor(){
        super();
        this.footer += " _" + (new Date()) + "_";
    }
};
const Doccer = new MyDoccer();

var json = require('./schema.json');
json['$comment'] = 'version ' + package.version;

Doccer.load(json);
Doccer.generate();

if(Doccer.errors.length > 0){
    console.log('errors', Doccer.errors);
} else {
    fs.writeFile('./schema.md', Doccer.markdown, function(err){
        console.log(err || "No errors writing schema.md");
    });
}