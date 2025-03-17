
import {JSONSchemaMarkdownDoc as JSONSchemaMarkdownDocBase } from 'json-schema-doc';

export class JSONSchemaMarkdownDoc extends JSONSchemaMarkdownDocBase {
    constructor(schema){
        super(schema);
        this.footer = "\n*Generated with [json-schema-md-doc](https://brianwendt.github.io/json-schema-md-doc/)*\n";
        this.footer += "*" + (new Date()) + "*";
    }
}

