class JSONSchemaMarkdown {
    constructor() {
        this.schema = null;
        this.markdown = null;
        this.errors = [];
        this.indentChar = "\t";
        this.objectNotation = "&thinsp;.&thinsp;";
        this.footer = "\n_Generated with [json-schema-md-doc](https://brianwendt.github.io/json-schema-md-doc/)_";
    }
    load(schema) {
        this.errors = [];
        if (typeof schema === "string") {
            try {
                this.schema = JSON.parse(schema);
            } catch (e) {
                this.error('invalid json');
            }
        } else {
            this.schema = schema;
        }
    }
    generate() {
        this.markdown = "";
        if (this.errors.length < 1) {
            try {
                this.generateChildren("", this.schema, 0, "");
            } catch (e) {
                console.log(e);
                this.error(e.toString());
            }
        }
        if (this.errors.length > 0) {
            return this.errors.join("\n");
        } else {
            this.markdown += this.footer;
            return this.markdown;
        }
    }

    error(error) {
        this.errors.push(error);
    }

    generateChildren(name, data, level, path) {
        this.typeGeneric(name, data, level, path);
        if (typeof data.type === "string") {
            this.getTypeMethod(data.type)(name, data, level, path);
        } else if (Array.isArray(data.type)) {
            data.type.map(type => {
                this.getTypeMethod(type)(name, data, level, path);
            });
        }
        if (this.notEmpty(data.definitions)) {
            path += "/definitions";
            this.writeHeader("definitions", level, path);
            for (var defName in data.definitions) {
                var defPath = path + "/" + defName;
                var definition = data.definitions[defName];
                this.generateChildren(defName, definition, level + 1, defPath);
            }
        }
    }

    getTypeMethod(type) {
        switch (type) {
            case "string":
                return this.typeString.bind(this);
                ;
            case "integer":
            case "number":
                return this.typeNumber.bind(this);
                ;
            case "object":
                return this.typeObject.bind(this);
                ;
            case "array":
                return this.typeArray.bind(this);
                ;
            case "boolean":
                return this.typeNull.bind(this);
                ;
            default:
                return this.typeUnknown.bind(this);
        }
    }

    refLink(ref) {
        if (ref[0] !== '#' && ref.substring(0, 4).toLowerCase() !== "http") {
            ref = '#' + this.slugify(ref);
        }
        return ref;
    }

    slugify(string) {
        return string.toString().toLowerCase()
                .replace(/\s+/g, '-') // Replace spaces with -
                .replace(/&/g, '-and-') // Replace & with ‘and’
                .replace(/[^\w-.]+/g, '') // Remove all non-word characters
                .replace(/--+/g, '-') // Replace multiple - with single -
                .replace(/^-+/, '') // Trim - from start of text
                .replace(/-+$/, ''); // Trim - from end of text
    }

    typeArray(name, data, level, path) {
        this.writeAdditionalItems(data.additionalItems);
        if (this.notEmpty(data.minItems) || this.notEmpty(data.maxItems)) {
            this.indent(level);
            this.markdown += "Item Count: ";
            this.writeMinMax(data.minItems, data.maxItems);
        }
        if (this.notEmpty(data.items)) {
            this.writeSectionHeader("Items", level + 1, path + "/items");
            if (Array.isArray(data.items)) {
                // Multiple Item Validations / "Tuple validation"
                data.items.map(item => {
                    this.generateChildren('item', item, level + 1, path + "/items");
                    this.writeLine("", level);
                });
            } else if (this.notEmpty(data.items)) {
                //Normal Validation
                this.generateChildren('item', data.items, level + 1, path + "/items");
            }
        }
    }

    typeBoolean(name, data, level, path) {
    }

    typeNull(name, data, level, path) {
    }

    typeNumber(name, data, level, path) {
        if (this.notEmpty(data.minimum) || this.notEmpty(data.maximum)) {
            this.indent(level);
            this.markdown += "Range: ";
            this.writeMinMax(data.minimum, data.maximum);
        }
        if (this.notEmpty(data.exclusiveMinimum) || this.notEmpty(data.exclusiveMaximum)) {
            this.indent(level);
            this.markdown += "Exlusive Range: ";
            this.writeMinMax(data.exclusiveMinimum, data.exclusiveMaximum);
        }
        this.writeMultipleOf(data.multipleOf);
    }

    typeString(name, data, level, path) {
        this.writeFormat(data.format, level);
        this.writePattern(data.pattern, level);
        if (this.notEmpty(data.minLength) || this.notEmpty(data.maxLength)) {
            this.indent(level);
            this.markdown += "Length: ";
            this.writeMinMax(data.minLength, data.maxLength);
        }

    }

    typeObject(name, data, level, path) {
        const required = (this.empty(data.required)) ? [] : data.required;
        if (this.empty(data.properties)) {
            throw "`object` missing properties at " + path;
        }
        this.writeAdditionalProperties(data.additionalProperties, level);

        if (this.notEmpty(data.minProperties) || this.notEmpty(data.maxProperties)) {
            this.indent(level);
            this.markdown += "Property Count: ";
            this.writeMinMax(data.minProperties, data.maxProperties);
        }

        this.writePropertyNames(data.propertyNames, level);
        this.writeSectionHeader("Properties", level, path);
        path += "/properties";
        for (var propName in data.properties) {
            var propPath = path + "/" + propName;
            var property = data.properties[propName];
            if (name.length > 0) {
                propName = name + this.objectNotation + propName;
            }
            var isRequired = (required.indexOf(propName) > -1);
            this.writePropertyName(propName, property, level + 1, propPath, isRequired);
            this.generateChildren(propName, property, level + 2, propPath);
        }
    }

    typeGeneric(name, data, level, path) {
        this.writePath(level, path);
        this.writeHeader(data.title, level, path);
        this.writeSchema(data["$schema"], level);
        this.writeRef(data["$ref"], level, path);
        this.writeId(data["$id"], level, path);
        this.writeDescription(data.description, level, path);
        this.writeComment(data["$comment"], level, path);
        this.writeType(data.type, level, path);
        this.writeExamples(data.examples, level, path);
        this.writeEnum(data.enum, level);
        this.writeDefault(data.default, level, path);
    }

    typeUnknown(data, level, path) {
        console.log('unknown prop type "', data.type, '" at ' + path, data);
    }

    // Markdown writing methods

    indent(level, indentChar = false, listChar = ' - ') {
        if(level > 1){
            this.markdown += (indentChar || this.indentChar).repeat(level - 1);
        }
        if(level > 0){
             this.markdown += listChar;
        }
    }

    valueBool(bool) {
        if (typeof bool === "string") {
            return bool;
        } else {
            return (bool) ? "true" : "false";
        }
    }

    valueFormat(value) {
        if (value === "true" || value === "false") {
            return '_' + value + '_';
        } else if (typeof value === "boolean") {
            return '_' + this.valueBool(value) + '_';
        } else if (typeof value === "string") {
            return '_"' + value + '"_';
        } else {
            return "`" + value + "`";
        }
    }

    writeAdditionalItems(value, level) {
        if (this.notEmpty(value)) {
            this.indent(level);
            this.writeLine("Additional Items: `" + this.valueBool(value) + "`", level);
        }
    }

    writeAdditionalProperties(value, level) {
        if (this.notEmpty(value)) {
            this.writeLine("Additional Properties: `" + this.valueBool(value) + "`", level);
        }
    }

    writeComment(text, level) {
        if (this.notEmpty(text)) {
            this.writeLine("&#36;comment: _" + text + "_", level);
        }
    }

    writeDefault(value, level) {
        if (this.notEmpty(value)) {
            this.writeLine("Default: " + this.valueFormat(value), level);
        }
    }

    writeDescription(text, level) {
        if (this.notEmpty(text)) {
            this.writeLine("_" + text.replace("\n", "<br>") + "_", level);
        }
    }

    writeEnum(list, level) {
        if (this.notEmpty(list)) {
            this.writeLine("Enum Values: ", level);
            this.writeList(list, level + 1);
        }
    }

    writeFormat(text, level) {
        if (this.notEmpty(text)) {
            this.writeLine('Format: "' + text + '"', level);
        }
    }

    writeExamples(list, level) {
        if (this.notEmpty(list)) {
            this.writeLine("Examples: ", level);
            this.writeList(list, level + 1);
        }
    }

    writeHeader(text, level = 1, path) {
        if (this.notEmpty(text)) {
            this.writeLine(("#").repeat(Math.min(level+1, 5)) + " " + text, level);
    }
    }

    writeId(text, level) {
        if (this.notEmpty(text)) {
            this.writeLine('<b id="' + this.slugify(text) + '">&#36;id: ' + text + "</b>", level);
        }
    }

    writeLine(text = "", level = 1) {
        this.indent(level);
        this.markdown += text + "\n";
        if(level < 1){
            this.markdown += "\n";
        }
    }

    writeList(list, level = 1) {
        if (this.notEmpty(list)) {
            list.map((item, idx) => {
                this.indent(level, false, " " + (idx + 1));
                this.markdown += ". " + this.valueFormat(item) + "\n";
            });
    }
    }

    writeMinMax(min, max) {
        if (this.notEmpty(min) && this.notEmpty(max)) {
            this.markdown += "between " + min + " and " + max + "\n";
        } else if (this.notEmpty(min)) {
            this.markdown += " &ge; " + min + "\n";
        } else if (this.notEmpty(max)) {
            this.markdown += " &le; " + max + "\n";
        }
    }

    writeMinMaxExlusive(min, max) {
        if (this.notEmpty(min)) {
            this.markdown += " > " + min + "\n";
        }
        if (this.notEmpty(min) && this.notEmpty(max)) {
            this.markdown += " & ";
        }
        if (this.notEmpty(max)) {
            this.markdown += " < " + max + "\n";
        }
    }

    writeMultipleOf(number, level) {
        if (this.notEmpty(number)) {
            this.writeLine("Multiple Of: `" + number + "`", level);
        }
    }

    writePattern(text, level) {
        if (this.notEmpty(text)) {
            this.writeLine("Pattern: `" + text + "`", level);
        }
    }

    writePropertyNames(data, level) {
        if (this.notEmpty(data) && this.notEmpty(data.pattern)) {
            this.writeLine("Property Names Pattern: `" + data.pattern + "`", level);
        }
    }

    writePropertyName(prop, property, level, path, required = false) {
        this.indent(level);
        this.markdown += '<i id="' + path + '">' + prop + '</i>'
        if (required) {
            this.markdown += " `required`";
        }
        this.markdown += "\n";
    }

    writeRef(text, level) {
        if (this.notEmpty(text)) {
            this.writeLine("&#36;ref: [" + text + "](" + this.refLink(text) + ")", level);
        }
    }
    
    writePath(level, path){
        if(this.notEmpty(path)){
            this.writeLine('<i id="' + path + '">path: ' + path + '</i>', level);
        }
    }

    writeSchema(text, level) {
        if (this.notEmpty(text)) {
            this.writeLine("&#36;schema: [" + text + "](" + this.refLink(text) + ")", level);
        }
    }

    writeSectionHeader(text, level = 1) {
        if (this.notEmpty(text)) {
            this.writeLine('**_' + text + "_**", level);
    }
    }

    writeType(text, level) {
        if (this.notEmpty(text)) {
            if (Array.isArray(text) && text.length > 1) {
                this.writeLine("Types: `" + text.join('`, `') + "`", level);
            } else {
                this.writeLine("Type: `" + text + "`", level);
            }
        }
    }

    writeUniqueItems(value, level) {
        if (this.notEmpty(value)) {
            this.writeLine("Unique Items: `" + this.valueBool(value) + "`", level);
        }
    }

    notEmpty(value) {
        return !this.empty(value);
    }
    empty(value) {
        return typeof value === "undefined"
                || value === null
                || (typeof value === "string" && value.length < 1)
                || (typeof value === "array" && value.length < 1);
    }
}
;
if(typeof module !== "undefined"){
    module.exports.JSONSchemaMarkdown = JSONSchemaMarkdown;
}