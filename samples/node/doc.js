import {JSONSchemaMarkdownDoc} from 'json-schema-doc';
import fs from 'fs';

class MyDoccer extends JSONSchemaMarkdownDoc {
    constructor(schema){
        super(schema);
        this.footer += " _" + (new Date()) + "_";
    }
}

const schema = fs.readFileSync('./samples/node/schema.json', 'utf8');

const Doccer = new MyDoccer(schema);

const md = Doccer.generate();

if(Doccer.errors.length > 0){
    console.log('errors', Doccer.errors);
} else {
    fs.writeFile('./samples/node/schema.md', Doccer.response, function(err){
        console.log(err || "No errors writing schema.md");
    });
}
