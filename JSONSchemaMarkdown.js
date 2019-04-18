class JSONSchemaMarkdown {
    constructor() {
        this.schema = null;
        this.markdown = null;
        this.errors = [];
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
                this.generateChildren("", this.schema, 1, "/");
            } catch (e) {
                console.log(e);
                this.error(e.toString());
            }
        }
        if (this.errors.length > 0) {
            return this.errors.join("\n");
        } else {
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
        } else {
            console.log(name, typeof data.type);
        }
        if (this.notEmpty(data.definitions)) {
            path += "definitions/";
            this.writeHeader("definitions", level + 1, path);
            for (var defName in data.definitions) {
                var defPath = path + defName + "/";
                var definition = data.definitions[defName];
                this.generateChildren(defName, definition, level + 2, defPath);
                this.writeLine(" ", level);
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
                ;
        }
    }

    refLink(ref) {
        if (ref[0] !== '#') {
            ref = '#' + ref;
        }
        return ref;
    }

    typeArray(name, data, level, path) {
        if (this.notEmpty(data.items)) {
            this.writeHeader("Items", level + 1, path + "items/");
            if (this.notEmpty(data.items.type)) {
                this.generateChildren('item', data.items, level + 1, path + "items/");
            }
        }
    }

    typeBoolean(name, data, level, path) {
    }

    typeNull(name, data, level, path) {
    }

    typeNumber(name, data, level, path) {
    }

    typeString(name, data, level, path) {
        this.writeEnum(data.enum);
    }

    typeObject(name, data, level, path) {
        const required = (this.empty(data.required)) ? [] : data.required;
        if (this.empty(data.properties)) {
            throw "`object` missing properties at " + path;
        }
        path += "properties/";
        this.writeHeader("Properties", level + 1, path);
        for (var propName in data.properties) {
            var propPath = path + propName + "/";
            var property = data.properties[propName];
            if (name.length > 0) {
                propName = name + "->" + propName;
            }
            this.writePropertyName(propName, property, level, propPath);
            this.generateChildren(propName, property, level + 1, propPath);
            this.writeLine(" ", level);
        }
    }

    typeGeneric(name, data, level, path) {
        this.writeHeader(data.title, level, path);
        this.writeRef(data["$ref"], level, path);
        this.writeId(data["$id"], level, path);
        this.writeDescription(data.description, level, path);
        this.writeComment(data["$comment"], level, path);
        this.writeType(data.type, level, path);
        this.indent(level);
        this.writeExamples(data.examples, level, path);
        this.writeDefault(data.default, level, path);
    }

    typeUnknown(data, level, path) {
        console.log('unknown prop type "', data.type, '" at ' + path, data);
    }

    // Markdown writing methods

    indent(level) {
        this.markdown += (">").repeat(level - 1);
    }

    writeComment(text, level, path) {
        if (this.notEmpty(text)) {
            this.indent(level);
            this.markdown += "$comment: `" + text + "`\n";
        }
    }

    writeDefault(value) {
        if (this.notEmpty(value)) {
            if (value === "true" || value === "false") {
                value = '_' + value + '_';
            } else if (typeof value === "string") {
                value = '"' + value + '"';
            }
            this.markdown += "Default: " + value + "\n";
        }
    }

    writeDescription(text, level) {
        if (this.notEmpty(text)) {
            this.indent(level);
            this.markdown += "> " + text + "\n\n";
        }
    }

    writeEnum(list, level) {
        if (this.notEmpty(list)) {
            this.markdown += "Enum values: [" + list.map(value => {
                if (value === "true" || value === "false") {
                    return '_' + value + '_';
                } else if (typeof value === "string") {
                    return '"' + value + '"';
                } else {
                    return "`" + value + "`";
                }
            }).join(", ") + "]\n";
        }
    }

    writeExamples(list) {
        if (this.notEmpty(list)) {
            this.markdown += "Examples: " + list.map(value => {
                if (value === "true" || value === "false") {
                    return '_' + value + '_';
                } else if (typeof value === "string") {
                    return '`"' + value + '"`';
                } else {
                    return "`" + value + "`";
                }
            }).join(", ") + "\n";
        }
    }

    writeHeader(text, level = 1) {
        if (this.notEmpty(text)) {
            this.markdown += ("#").repeat(level) + " " + text + "\n";
    }
    }

    writeId(text, level) {
        this.writeHeader(text, level + 2);
    }

    writeLine(text = "", level = 1) {
        this.indent(level);
        this.markdown += text + "\n";
    }

    writePropertyName(prop, property, level, path) {
        this.indent(level);
        this.markdown += "**" + prop + "**\n";
    }

    writeRef(text, level) {
        if (this.notEmpty(text)) {
            this.indent(level);
            this.markdown += "$ref: [" + text + "](" + this.refLink(text) + ")\n";
        }
    }

    writeType(text, level) {
        if (this.notEmpty(text)) {
            this.indent(level);
            if (Array.isArray(text) && text.length > 1) {
                this.markdown += "Types: `" + text.join('`, `') + "`\n";
            } else {
                this.markdown += "Type: `" + text + "`\n";
            }
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