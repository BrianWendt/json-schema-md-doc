/**
 * @description Converts JSON Schema to Markdown documentation.
 * @author Brian Wendt <brianwendt@users.noreply.github.com>
 * @link https://github.com/BrianWendt/json-schema-md-doc
 * @module JSONSchemaMarkdown
 */
class JSONSchemaMarkdownDoc {
    constructor() {
        this.schema = null;
        this.markdown = "";
        this.errors = [];
        this.indentChar = "\t";
        this.pathDivider = "/";
        this.objectNotation = "&thinsp;.&thinsp;";
        this.footer = "\n_Generated with [json-schema-md-doc](https://brianwendt.github.io/json-schema-md-doc/)_";
        this.useHtml = true;
        this.emphasisChar = "*";
    }
    static doc(schema) {
        return (new this()).load(schema).generate();
    }
    load(schema) {
        this.errors = [];
        if (typeof schema === "string") {
            try {
                this.schema = JSON.parse(schema);
            }
            catch (e) {
                this.error('invalid json: ' + e.message);
            }
        }
        else {
            this.schema = schema;
        }
        return this;
    }
    generate() {
        this.markdown = "";
        if (this.errors.length < 1) {
            try {
                this.generateChildren("", this.schema, 0, "#");
            }
            catch (e) {
                this.error(e.toString());
            }
        }
        if (this.errors.length > 0) {
            return this.errors.join("\n");
        }
        else {
            this.markdown += this.footer;
            return this.markdown;
        }
    }
    generateChildren(name, data, level, path) {
        if (typeof (data === null || data === void 0 ? void 0 : data.$id) === "string") {
            path = "#" + data.$id;
        }
        this.decernType(data);
        this.typeGeneric(name, data, level, path);
        data.type.forEach(type => {
            this.getTypeMethod(type)(name, data, level, path);
        });
        if (typeof data.definitions === "object" && Object.keys(data.definitions).length > 0) {
            path += "/definitions";
            this.writeHeader("definitions", level, path);
            for (const term in data.definitions) {
                const defPath = path + this.pathDivider + term;
                this.writeTerm(term, level);
                this.generateChildren(term, data.definitions[term], level + 1, defPath);
                this.writeLine("", 0);
            }
        }
    }
    decernType(data) {
        if (typeof data.type === "string") {
            data.type = [data.type];
            return data.type;
        }
        else if (Array.isArray(data.type)) {
            return data.type;
        }
        data.type = [];
        if (this.hasAnyProperty(data, ['items', 'additionalItems', 'minItems', 'maxItems', 'uniqueItems', 'contains'])) {
            data.type.push('array');
        }
        if (this.hasAnyProperty(data, ['minimum', 'maximum', 'exclusiveMinimum', 'exclusiveMaximum', 'multipleOf'])) {
            data.type.push('number');
        }
        if (this.hasAnyProperty(data, ['required', 'properties', 'additionalProperties', 'patternProperties', 'minProperties', 'maxProperties', 'propertyNames', 'dependencies'])) {
            data.type.push('object');
        }
        if (this.hasAnyProperty(data, ['maxLength', 'minLength', 'pattern', 'format'])) {
            data.type.push('string');
        }
        console.log('decernType', data.type);
        return data.type;
    }
    hasProperty(data, prop) {
        return data.hasOwnProperty(prop);
    }
    hasAnyProperty(data, props) {
        return props.some(prop => this.hasProperty(data, prop));
    }
    typeGeneric(name, data, level, path) {
        this.writeHeader(data.title, level, path);
        this.writeDescription(data.description, level, path);
        this.writeType(data.type, level, path);
        this.writePath(level, path);
        this.writeSchema(data.$schema, level);
        this.writeRef(data.$ref, level);
        this.writeId(data.$id, level, path);
        this.writeComment(data.$comment, level, path);
        this.writeExamples(data.examples, level, path);
        this.writeUniqueItems(data.uniqueItems, level);
        this.writeEnum(data.enum, level);
        this.writeDefault(data.default, level, path);
        this.writeConst(data.const, level);
        this.writeConditional(data.if, data.then, data.else, level);
        this.writeContentEncoding(data.contentEncoding, level);
        this.writeContentMediaType(data.contentMediaType, level);
    }
    typeArray(name, data, level, path) {
        this.writeAdditionalItems(data.additionalItems);
        if (this.notEmpty(data.minItems) || this.notEmpty(data.maxItems)) {
            this.indent(level);
            this.markdown += "Item Count: ";
            this.writeMinMax(data.minItems, data.maxItems);
        }
        if (this.notEmpty(data.items)) {
            this.writeSectionName("Items", level + 1, path + "/items");
            if (Array.isArray(data.items)) {
                data.items.forEach(item => {
                    this.generateChildren('item', item, level + 1, path + "/items");
                    this.writeLine("", level);
                });
            }
            else if (this.notEmpty(data.items) && typeof data.items === "object") {
                this.generateChildren('item', data.items, level + 1, path + "/items");
            }
        }
        this.writeContains(data.contains, level);
    }
    typeBoolean(name, data, level, path) {
        // Implement typeBoolean logic if needed
    }
    typeNull(name, data, level, path) {
        // Implement typeNull logic if needed
    }
    typeNumber(name, data, level, path) {
        if (this.notEmpty(data.minimum) || this.notEmpty(data.maximum)) {
            this.indent(level);
            this.markdown += "Range: ";
            this.writeMinMax(data.minimum, data.maximum);
        }
        if (this.notEmpty(data.exclusiveMinimum) || this.notEmpty(data.exclusiveMaximum)) {
            this.indent(level);
            this.markdown += "Exclusive Range: ";
            this.writeMinMaxExclusive(data.exclusiveMinimum, data.exclusiveMaximum);
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
        var _a;
        const required = (_a = data.required) !== null && _a !== void 0 ? _a : [];
        const properties = data.properties || {};
        this.writeAdditionalProperties(data.additionalProperties, level);
        if (this.notEmpty(data.minProperties) || this.notEmpty(data.maxProperties)) {
            this.indent(level);
            this.markdown += "Property Count: ";
            this.writeMinMax(data.minProperties, data.maxProperties);
        }
        this.writePropertyNames(data.propertyNames, level);
        this.writeSectionName("Properties", level, path);
        path += "/properties";
        for (const propName in properties) {
            const propPath = path + this.pathDivider + propName;
            const property = properties[propName];
            const isRequired = required.includes(propName);
            this.writePropertyName(propName, level + 1, propPath, isRequired);
            this.generateChildren(propName, property, level + 2, propPath);
        }
        this.writeDependencies(data.dependencies, level);
    }
    typeUnknown(name, data, level, path) {
        console.error('unknown prop type in "', data.type, '" at ' + path, data);
    }
    writeAdditionalItems(bool, level = 1) {
        if (this.empty(bool)) {
            return this;
        }
        if (bool) {
            return this.writeLine("This schema " + this.underline("does not") + " accept additional items.", level);
        }
        else {
            return this.writeLine("This schema accepts additional items.", level);
        }
    }
    writeAdditionalProperties(bool, level = 1) {
        if (this.empty(bool)) {
            return this;
        }
        if (!bool) {
            return this.writeLine("This schema " + this.underline("does not") + " accept additional properties.", level);
        }
        else {
            return this.writeLine("This schema accepts additional properties.", level);
        }
    }
    writeComment(comment, level = 1, path) {
        if (this.empty(comment) || typeof comment !== "string") {
            return this;
        }
        const nl = (this.useHtml) ? "<br/>" : "\n";
        return this.writeLine(this.bold('Comment', path) + nl + this.italic(comment), level);
    }
    writeConst(constant, level = 1) {
        if (this.notEmpty(constant)) {
            this.writeLine("Constant value: " + this.valueFormat(constant), level);
        }
        return this;
    }
    writeConditional(ifSchema, thenSchema, elseSchema, level = 1) {
        if (this.notEmpty(ifSchema)) {
            this.writeLine("If: ", level);
            this.generateChildren("if", ifSchema, level + 1, "");
        }
        if (this.notEmpty(thenSchema)) {
            this.writeLine("Then: ", level);
            this.generateChildren("then", thenSchema, level + 1, "");
        }
        if (this.notEmpty(elseSchema)) {
            this.writeLine("Else: ", level);
            this.generateChildren("else", elseSchema, level + 1, "");
        }
        return this;
    }
    writeContentEncoding(contentEncoding, level = 1) {
        if (this.notEmpty(contentEncoding)) {
            this.writeLine("Content Encoding: " + contentEncoding, level);
        }
        return this;
    }
    writeContentMediaType(contentMediaType, level = 1) {
        if (this.notEmpty(contentMediaType)) {
            this.writeLine("Content Media Type: " + contentMediaType, level);
        }
        return this;
    }
    writeContains(contains, level = 1) {
        if (this.notEmpty(contains)) {
            this.writeLine("Contains: ", level);
            this.generateChildren("contains", contains, level + 1, "");
        }
        return this;
    }
    writeDefault(value, level = 1, path) {
        if (this.notEmpty(value)) {
            this.writeLine("Default: " + this.valueFormat(value), level);
        }
        return this;
    }
    writeDescription(description, level = 1, path) {
        if (this.notEmpty(description) && typeof description === "string") {
            this.writeLine("_" + description.replace("\n", "<br>") + "_", level);
        }
        return this;
    }
    writeDependencies(dependencies, level = 1) {
        if (this.notEmpty(dependencies)) {
            this.writeLine("Dependencies: ", level);
            this.writeList(Object.keys(dependencies), level + 1);
        }
        return this;
    }
    writeEnum(list, level = 1) {
        if (this.notEmpty(list) && typeof list === "object") {
            this.writeLine("The value is restricted to the following: ", level);
            this.writeList(list, level + 1);
        }
        return this;
    }
    writeFormat(format, level = 1) {
        if (this.notEmpty(format)) {
            this.writeLine('String format must be a "' + format + '"', level);
        }
        return this;
    }
    writeExamples(list, level = 1, path) {
        if (this.notEmpty(list) && typeof list === "object") {
            this.writeLine("Example values: ", level);
            this.writeList(list, level + 1);
        }
        return this;
    }
    writeHeader(header, level = 1, path) {
        if (this.notEmpty(header)) {
            this.writeLine(("#").repeat(Math.min(level + 1, 5)) + " " + header, level);
        }
        return this;
    }
    writeId(id, level = 1, path) {
        if (this.notEmpty(id) && typeof id === "string") {
            this.writeLine(this.bold("&#36;id: " + id, id), level);
        }
        return this;
    }
    writeList(list, level = 1) {
        if (this.notEmpty(list)) {
            list.forEach((item, idx) => {
                this.indent(level, false, " " + (idx + 1));
                this.markdown += ". " + this.valueFormat(item) + "\n";
            });
        }
        return this;
    }
    writeMinMax(min, max) {
        if (this.notEmpty(min) && this.notEmpty(max)) {
            this.markdown += "between " + min + " and " + max + "\n";
        }
        else if (this.notEmpty(min)) {
            this.markdown += " &ge; " + min + "\n";
        }
        else if (this.notEmpty(max)) {
            this.markdown += " &le; " + max + "\n";
        }
        return this;
    }
    writeMinMaxExclusive(min, max) {
        if (this.notEmpty(min)) {
            this.markdown += " > " + min + "\n";
        }
        if (this.notEmpty(min) && this.notEmpty(max)) {
            this.markdown += " & ";
        }
        if (this.notEmpty(max)) {
            this.markdown += " < " + max + "\n";
        }
        return this;
    }
    writeMultipleOf(number, level = 1) {
        if (this.notEmpty(number)) {
            this.writeLine("The value must be a multiple of `" + number + "`", level);
        }
        return this;
    }
    writePattern(pattern, level = 1) {
        if (this.notEmpty(pattern)) {
            this.writeLine("The value must match this pattern: `" + pattern + "`", level);
        }
        return this;
    }
    writePropertyNames(data, level = 1) {
        if (typeof (data === null || data === void 0 ? void 0 : data.pattern) === "string") {
            this.writeLine("Property names must match this pattern: `" + data.pattern + "`", level);
        }
        return this;
    }
    writePropertyName(prop, level = 1, path, required = false) {
        this.indent(level);
        this.markdown += this.bold(prop, path);
        if (required) {
            this.markdown += " `required`";
        }
        this.markdown += "\n";
        return this;
    }
    writeRef(ref, level = 1) {
        if (this.notEmpty(ref) && typeof ref === "string") {
            this.writeLine("&#36;ref: [" + this.escapeLink(ref) + "](" + this.refLink(ref) + ")", level);
        }
        return this;
    }
    writePath(level = 1, path) {
        if (this.notEmpty(path)) {
            this.writeLine(this.italic("path: " + path, path.replace('#', '')), level);
        }
        return this;
    }
    writeSchema(uri, level = 1) {
        if (typeof uri === "string" && uri.length > 0) {
            this.writeLine("&#36;schema: [" + uri + "](" + this.refLink(uri) + ")", level);
        }
        return this;
    }
    writeSectionName(name, level = 1, path) {
        if (this.notEmpty(name)) {
            this.writeLine(this.boldItalic(name), level);
        }
        return this;
    }
    writeTerm(term, level = 1) {
        if (this.notEmpty(term)) {
            this.writeLine(this.boldItalic(term), level);
        }
        return this;
    }
    writeType(type, level = 1, path) {
        if (this.notEmpty(type)) {
            if (Array.isArray(type) && type.length > 1) {
                this.writeLine("Types: `" + type.join('`, `') + "`", level);
            }
            else {
                this.writeLine("Type: `" + type + "`", level);
            }
        }
        return this;
    }
    writeUniqueItems(bool, level = 1) {
        if (this.notEmpty(bool)) {
            if (bool) {
                this.writeLine("Each item must be unique", level);
            }
        }
        return this;
    }
    bold(text, id) {
        if (this.useHtml && id) {
            return this.tag("b", text, id);
        }
        else {
            return this.emphasize(text, 2);
        }
    }
    italic(text, id) {
        if (this.useHtml && id) {
            return this.tag("i", text, id);
        }
        else {
            return this.emphasize(text, 1);
        }
    }
    boldItalic(text, id) {
        if (this.useHtml && id) {
            return this.tag("b", this.italic(text), id);
        }
        else {
            return this.emphasize(text, 3);
        }
    }
    underline(text, id) {
        if (this.useHtml) {
            return this.tag("u", text, id);
        }
        else {
            return text; // Markdown does not support underline
        }
    }
    tag(tag, text, id) {
        id = this.slugify(id || text);
        return `<${tag} id="${id}">${text}</${tag}>`;
    }
    emphasize(text, c) {
        const e = this.emphasisChar.repeat(c);
        return e + text + e;
    }
    code(text) {
        return "`" + text + "`";
    }
    writeLine(text = "", level = 1) {
        this.indent(level);
        this.markdown += text + "\n";
        if (level < 1) {
            this.markdown += "\n";
        }
        return this;
    }
    getTypeMethod(type) {
        switch (type.toLowerCase()) {
            case "string":
                return this.typeString.bind(this);
            case "integer":
            case "number":
                return this.typeNumber.bind(this);
            case "object":
                return this.typeObject.bind(this);
            case "array":
                return this.typeArray.bind(this);
            case "boolean":
                return this.typeBoolean.bind(this);
            case "null":
                return this.typeNull.bind(this);
            default:
                return this.typeUnknown.bind(this);
        }
    }
    indent(level, indentChar = false, listChar = ' - ') {
        if (level > 1) {
            this.markdown += (indentChar || this.indentChar).repeat(level - 1);
        }
        if (level > 0) {
            this.markdown += listChar;
        }
    }
    valueBool(bool) {
        if (typeof bool === "string") {
            return bool;
        }
        else {
            return (bool) ? "true" : "false";
        }
    }
    valueFormat(value) {
        if (value === "true" || value === "false") {
            return this.italic(value);
        }
        else if (typeof value === "boolean") {
            return this.italic(this.valueBool(value));
        }
        else if (typeof value === "string") {
            return this.italic('"' + value + '"');
        }
        else {
            return this.code(value);
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
            .replace(/&/g, '-and-') // Replace & with "-and-"
            .replace(/[^\w-.]+/g, '') // Remove all non-word characters
            .replace(/--+/g, '-') // Replace multiple - with single -
            .replace(/^-+/, '') // Trim - from start of text
            .replace(/-+$/, ''); // Trim - from end of text
    }
    /**
     * @description Check if a value is empty (undefined, null, empty string, or empty array).
     */
    empty(value) {
        return typeof value === "undefined"
            || value === null
            || (typeof value === "string" && value.length < 1)
            || (Array.isArray(value) && value.length < 1);
    }
    notEmpty(value) {
        return !this.empty(value);
    }
    error(error) {
        this.errors.push(error);
        return this;
    }
    escapeLink(value) {
        return value.replace('$', '\\$'); //$ in [] breaks markdown 
    }
}
// export default JSONSchemaMarkdownDoc;
