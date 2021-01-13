/**
 * @author Brian Wendt <brianwendt@users.noreply.github.com>
 * @link https://github.com/BrianWendt/json-schema-md-doc
 */

class JSONSchemaMarkdown {
    constructor() {
        /**
         * Object containing the schema
         * @type {Object}
         */
        this.schema = null;

        /**
         * Resulting markdown
         * @type {String}
         */
        this.markdown = null;

        /**
         * Array of errors during load or markdown generation.
         * @type {String[]}
         */
        this.errors = [];

        /**
         * The character(s) used for indenting the markdown.
         * @type {String}
         */
        this.indentChar = "\t";

        /**
         * The character(s) used for dividing path elements.
         * @type {String}
         */
        this.pathDivider = "/";

        /**
         * The character(s) used for object notation.
         * @type {String}
         */
        this.objectNotation = "&thinsp;.&thinsp;";

        /**
         * Text to be included in the documentation's footer.
         * Defaults to optional module attribution.
         * @type {String}
         */
        this.footer = "\n_Generated with [json-schema-md-doc](https://brianwendt.github.io/json-schema-md-doc/)_";
    }

    /**
     * Shorthand method to generate markdown from JSON Schema.
     * This is not the prefered method as errors will be more difficult to expose.
     * @param {Object|String} schema JS object or JSON string.
     * @returns {String} generated markdown
     */
    static doc(schema) {
        return (new this()).load(schema).generate();
    }

    /**
     * Load the schema
     * @param {Object|String} schema JS object or JSON string.
     * @returns {nm$_JSONSchemaMarkdown.JSONSchemaMarkdown}
     */
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
        return this;
    }

    /**
     * Process loaded schema and generate the markdown
     * @returns {String}
     */
    generate() {
        this.markdown = "";
        if (this.errors.length < 1) {
            try {
                this.generateChildren("", this.schema, 0, "#");
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

    /**
     * This is the primary method that traverses the schema.
     * The method is strictly structural and should not need to be modified for customization.
     * @param {name} name The JSON property name
     * @param {Object} data The JS data for the schema
     * @param {integer} level Indentation level
     * @param {String} path String describing the path of the property
     */
    generateChildren(name, data, level, path) {
        if (this.notEmpty(data["$id"])) {
            // set this as base path to children.
            path = "#" + data["$id"];
        }
        //
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
            for (var term in data.definitions) {
                var defPath = path + this.pathDivider + term;
                this.writeTerm(term, level);
                this.generateChildren(term, data.definitions[term], level + 1, defPath);
                this.writeLine("", 0);
            }
        }
    }

    /**
     * This is the shared template for all other types.
     * You may want to override this method to change the order of information in your documentation.
     * @param {name} name The JSON property name
     * @param {Object} data The JS data for the schema
     * @param {integer} level Indentation level
     * @param {String} path String describing the path of the property
     */
    typeGeneric(name, data, level, path) {
        this.writeHeader(data.title, level, path);
        this.writeDescription(data.description, level, path);
        this.writeType(data.type, level, path);
        this.writePath(level, path);
        this.writeSchema(data["$schema"], level);
        this.writeRef(data["$ref"], level, path);
        this.writeId(data["$id"], level, path);
        this.writeComment(data["$comment"], level, path);
        this.writeExamples(data.examples, level, path);
        this.writeEnum(data.enum, level);
        this.writeDefault(data.default, level, path);
    }

    /**
     *
     * @param {name} name The JSON property name
     * @param {Object} data The JS data for the schema
     * @param {integer} level Indentation level
     * @param {String} path String describing the path of the property
     */
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

    /**
     *
     * @param {name} name The JSON property name
     * @param {Object} data The JS data for the schema
     * @param {integer} level Indentation level
     * @param {String} path String describing the path of the property
     */
    typeBoolean(name, data, level, path) {

    }

    /**
     *
     * @param {name} name The JSON property name
     * @param {Object} data The JS data for the schema
     * @param {integer} level Indentation level
     * @param {String} path String describing the path of the property
     */
    typeNull(name, data, level, path) {

    }

    /**
     *
     * @param {name} name The JSON property name
     * @param {Object} data The JS data for the schema
     * @param {integer} level Indentation level
     * @param {String} path String describing the path of the property
     */
    typeNumber(name, data, level, path) {
        if (this.notEmpty(data.minimum) || this.notEmpty(data.maximum)) {
            this.indent(level);
            this.markdown += "Range: ";
            this.writeMinMax(data.minimum, data.maximum);
        }
        if (this.notEmpty(data.exclusiveMinimum) || this.notEmpty(data.exclusiveMaximum)) {
            this.indent(level);
            this.markdown += "Exlusive Range: ";
            this.writeMinMaxExlusive(data.exclusiveMinimum, data.exclusiveMaximum);
        }
        this.writeMultipleOf(data.multipleOf);
    }

    /**
     *
     * @param {name} name The JSON property name
     * @param {Object} data The JS data for the schema
     * @param {integer} level Indentation level
     * @param {String} path String describing the path of the property
     */
    typeString(name, data, level, path) {
        this.writeFormat(data.format, level);
        this.writePattern(data.pattern, level);
        if (this.notEmpty(data.minLength) || this.notEmpty(data.maxLength)) {
            this.indent(level);
            this.markdown += "Length: ";
            this.writeMinMax(data.minLength, data.maxLength);
        }

    }

    /**
     *
     * @param {name} name The JSON property name
     * @param {Object} data The JS data for the schema
     * @param {integer} level Indentation level
     * @param {String} path String describing the path of the property
     */
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
        this.writeSectionName("Properties", level, path);
        path += "/properties";
        for (var propName in data.properties) {
            var propPath = path + this.pathDivider + propName;
            var property = data.properties[propName];
            var isRequired = (required.indexOf(propName) > -1);
            this.writePropertyName(propName, level + 1, propPath, isRequired);
            this.generateChildren(propName, property, level + 2, propPath);
        }
    }

    /**
     * This method is a catch for schema types that aren't recongized.
     * You may want to treat anything resolving to this method as an error.
     * @param {name} name The JSON property name
     * @param {Object} data The JS data for the schema
     * @param {integer} level Indentation level
     * @param {String} path String describing the path of the property
     */
    typeUnknown(name, data, level, path) {
        console.log('unknown prop type "', data.type, '" at ' + path, data);
    }

    /**
     * Markdown writing methods
     */

    /**
     * @see https://json-schema.org/understanding-json-schema/reference/array.html#tuple-validation
     * @param {boolean} bool
     * @param {Integer} level Indentation level
     */
    writeAdditionalItems(bool, level) {
        if (this.notEmpty(bool)) {
            if (bool) {
                this.writeLine("This schema <u>does not</u> accept additional items.", level);
            } else {
                this.writeLine("This schema accepts additional items.", level);
            }
        }
    }

    /**
     * @see https://json-schema.org/understanding-json-schema/reference/object.html#property-names
     * @param {boolean} bool
     * @param {Integer} level Indentation level
     *
     */
    writeAdditionalProperties(bool, level) {
        if (this.notEmpty(bool)) {
            if (!bool) {
                this.writeLine("This schema <u>does not</u> accept additional properties.", level);
            } else {
                this.writeLine("This schema accepts additional properties.", level);
            }
        }
    }

    /**
     * Format and write the schema's $comment
     * @see https://json-schema.org/understanding-json-schema/reference/generic.html#comments
     * @param {String} comment The comment
     * @param {Integer} level Indentation level
     *
     */
    writeComment(comment, level) {
        if (this.notEmpty(comment)) {
            this.writeLine("**Comment**<br/>_" + comment + "_", level);
        }
    }

    /**
     * Format and write the *.description
     * @see https://json-schema.org/understanding-json-schema/reference/generic.html
     * @param {*} value The default value
     * @param {Integer} level Indentation level
     *
     */
    writeDefault(value, level) {
        if (this.notEmpty(value)) {
            this.writeLine("Default: " + this.valueFormat(value), level);
        }
    }

    /**
     * Format and write the *.description
     * @see https://json-schema.org/understanding-json-schema/reference/generic.html
     * @param {String} description The description may include markdown
     * @param {Integer} level Indentation level
     *
     */
    writeDescription(description, level) {
        if (this.notEmpty(description)) {
            this.writeLine("_" + description.replace("\n", "<br>") + "_", level);
        }
    }

    /**
     * Write *.enum as a list.
     * @param {array} list Enumerated values
     * @param {Integer} level Indentation level
     *
     */
    writeEnum(list, level) {
        if (this.notEmpty(list)) {
            this.writeLine("The value is restricted to the following: ", level);
            this.writeList(list, level + 1);
        }
    }

    /**
     * @see https://json-schema.org/understanding-json-schema/reference/string.html#format
     * @param {String} format Format of string
     * @param {Integer} level Indentation level
     *
     */
    writeFormat(format, level) {
        if (this.notEmpty(format)) {
            this.writeLine('String format must be a "' + format + '"', level);
        }
    }

    /**
     * Write *.examples as a list
     * @see https://json-schema.org/understanding-json-schema/reference/generic.html
     * @param {array} list Examples
     * @param {Integer} level Indentation level
     *
     */
    writeExamples(list, level) {
        if (this.notEmpty(list)) {
            this.writeLine("Example values: ", level);
            this.writeList(list, level + 1);
        }
    }

    /**
     * @param {String} header The header to be written
     * @param {Integer} level Header level [H1, H2, H3, H4, H5]
     *
     */
    writeHeader(header, level = 1) {
        if (this.notEmpty(header)) {
            this.writeLine(("#").repeat(Math.min(level + 1, 5)) + " " + header, level);
    }
    }

    /**
     * Write the $id for reference purposes
     * @see https://json-schema.org/understanding-json-schema/structuring.html#the-id-property
     * @param {String} id the schema's $id
     * @param {Integer} level Indentation level
     *
     */
    writeId(id, level) {
        if (this.notEmpty(id)) {
            this.writeLine('<b id="' + this.slugify(id) + '">&#36;id: ' + id + "</b>", level);
        }
    }

    /**
     * Write array as markdown list
     * @param {array} list Mixed array to list
     * @param {Integer} level Indentation level
     *
     */
    writeList(list, level = 1) {
        if (this.notEmpty(list)) {
            list.map((item, idx) => {
                this.indent(level, false, " " + (idx + 1));
                this.markdown += ". " + this.valueFormat(item) + "\n";
            });
    }
    }

    /**
     * Write notation for inclusive minimum and maximum.
     * @param {number} min Inclusive minimim
     * @param {number} max Inclusive maximum
     *
     */
    writeMinMax(min, max) {
        if (this.notEmpty(min) && this.notEmpty(max)) {
            this.markdown += "between " + min + " and " + max + "\n";
        } else if (this.notEmpty(min)) {
            this.markdown += " &ge; " + min + "\n";
        } else if (this.notEmpty(max)) {
            this.markdown += " &le; " + max + "\n";
        }
    }

    /**
     * Write notation for exclusive minimum and maximum.
     * @param {number} min Exclusive minimim
     * @param {number} max Exclusive maximum
     *
     */
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

    /**
     * @see https://json-schema.org/understanding-json-schema/reference/numeric.html#multiples
     * @param {Number} number Regular Expression that string must match.
     * @param {Integer} level Indentation level
     *
     */
    writeMultipleOf(number, level) {
        if (this.notEmpty(number)) {
            this.writeLine("The value must be a multiple of `" + number + "`", level);
        }
    }

    /**
     * @see https://json-schema.org/understanding-json-schema/reference/string.html#regular-expressions
     * @param {String} pattern Regular Expression that string must match.
     * @param {Integer} level Indentation level
     *
     */
    writePattern(pattern, level) {
        if (this.notEmpty(pattern)) {
            this.writeLine("The value must match this pattern: `" + pattern + "`", level);
        }
    }

    /**
     * Writes the features of object.propertyNames
     * @see https://json-schema.org/understanding-json-schema/reference/object.html#property-names
     * @param {String} data Schema object
     * @param {Integer} level Indentation level
     *
     */
    writePropertyNames(data, level) {
        if (this.notEmpty(data) && this.notEmpty(data.pattern)) {
            this.writeLine("Property names must match this pattern: `" + data.pattern + "`", level);
        }
    }

    /**
     * @param {String} prop Property name
     * @param {Integer} level Indentation level
     * @param {String} path String describing the path of the property
     * @param {boolean} required Property is required (True or False [default])
     *
     */
    writePropertyName(prop, level, path, required = false) {
        this.indent(level);
        this.markdown += '<b id="' + path + '">' + prop + '</b>';
        if (required) {
            this.markdown += " `required`";
        }
        this.markdown += "\n";
    }

    /**
     * Writes a link to the referenced schema
     * @see https://json-schema.org/understanding-json-schema/structuring.html#reuse
     * @param {String} ref $ID, path, or URI
     * @param {Integer} level Indentation level
     *
     */
    writeRef(ref, level) {
        if (this.notEmpty(ref)) {
            this.writeLine("&#36;ref: [" + ref + "](" + this.refLink(ref) + ")", level);
        }
    }

    /**
     * Writes the path for reference purposes
     * @param {Integer} level Indentation level
     * @param {String} path String describing the path of the property
     *
     */
    writePath(level, path) {
        if (this.notEmpty(path)) {
            this.writeLine('<i id="' + path + '">path: ' + path + '</i>', level);
        }
    }

    /**
     * Writes the declared schema URI
     * @see https://json-schema.org/understanding-json-schema/basics.html#declaring-a-json-schema
     * @param {String} uri
     * @param {Integer} level Indentation level
     *
     */
    writeSchema(uri, level) {
        if (this.notEmpty(uri)) {
            this.writeLine("&#36;schema: [" + uri + "](" + this.refLink(uri) + ")", level);
        }
    }

    /**
     * Writes a section name
     * @param {String} name
     * @param {Integer} level Indentation level
     *
     */
    writeSectionName(name, level = 1) {
        if (this.notEmpty(name)) {
            this.writeLine('**_' + name + "_**", level);
        }
    }

    /**
     * Writes a definition term
     * @param {String} term
     * @param {Integer} level Indentation level
     *
     */
    writeTerm(term, level) {
        if (this.notEmpty(term)) {
            this.writeLine('**_' + term + "_**", level);
        }
    }

    /**
     * @see https://json-schema.org/understanding-json-schema/basics.html#the-type-keyword
     * @param {String} type
     * @param {Integer} level Indentation level
     *
     */
    writeType(type, level) {
        if (this.notEmpty(type)) {
            if (Array.isArray(type) && type.length > 1) {
                this.writeLine("Types: `" + type.join('`, `') + "`", level);
            } else {
                this.writeLine("Type: `" + type + "`", level);
            }
        }
    }

    /**
     * @see https://json-schema.org/understanding-json-schema/reference/array.html#uniqueness
     * @param {boolean} bool
     * @param {Integer} level Indentation level
     *
     */
    writeUniqueItems(bool, level) {
        if (this.notEmpty(bool)) {
            if (bool) {
                this.writeLine("Each item must be unique", level);
            }
        }
    }

    /**
     * Below are utility methods.
    **/

    /**
     * Handles finding correct method for different schema types.
     * @param {String} type The schema type/
     * @returns {nm$_JSONSchemaMarkdown.JSONSchemaMarkdown.typeUnknown}
     */
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
                return this.typeNull.bind(this);
            default:
                return this.typeUnknown.bind(this);
        }
    }

    /**
     * Writes indentation at the given level.
     * @param {Integer} level Indentation level
     * @param {string} indentChar Character to use for indentation. Defaults to this.indentChar
     * @param {type} listChar Character to use for list
     *
     */
    indent(level, indentChar = false, listChar = ' - ') {
        if (level > 1) {
            this.markdown += (indentChar || this.indentChar).repeat(level - 1);
        }
        if (level > 0) {
            this.markdown += listChar;
    }
    }

    /**
     * Converts boolean to string "true" or "false"
     * @param {type} bool
     * @returns {String}
     *
     */
    valueBool(bool) {
        if (typeof bool === "string") {
            return bool;
        } else {
            return (bool) ? "true" : "false";
        }
    }

    /**
     * Convert mixed values into markdown notation.
     * @param {mixed} value
     * @returns {String}
     *
     */
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

    /**
     * Utility method for writing line to the markdown.
     * Handles line break logic.
     * @param {String} text
     * @param {Integer} level Indentation level
     *
     */
    writeLine(text = "", level = 1) {
        this.indent(level);
        this.markdown += text + "\n";
        if (level < 1) {
            this.markdown += "\n";
    }
    }

    /**
     * Prepare $ref as a link.
     * @param {String} ref The schema $ref
     * @returns {String}
     */
    refLink(ref) {
        if (ref[0] !== '#' && ref.substring(0, 4).toLowerCase() !== "http") {
            ref = '#' + this.slugify(ref);
        }
        return ref;
    }

    /**
     * Make a string into a slug string.
     * @param {String} string
     * @returns {String}
     */
    slugify(string) {
        return string.toString().toLowerCase()
                .replace(/\s+/g, '-') // Replace spaces with -
                .replace(/&/g, '-and-') // Replace & with ‘and’
                .replace(/[^\w-.]+/g, '') // Remove all non-word characters
                .replace(/--+/g, '-') // Replace multiple - with single -
                .replace(/^-+/, '') // Trim - from start of text
                .replace(/-+$/, ''); // Trim - from end of text
    }

    /**
     * Check if value is empty
     * @param {*} value
     * @returns {Boolean}
     *
     */
    empty(value) {
        return typeof value === "undefined"
                || value === null
                || (typeof value === "string" && value.length < 1)
                || (typeof value === "array" && value.length < 1);
    }

    /**
     * Check if value is NOT empty
     * @param {*} value
     * @returns {Boolean}
     *
     */
    notEmpty(value) {
        return !this.empty(value);
    }

    /**
     * Append error to errors array
     * @param {String} error Error message
     *
     */
    error(error) {
        this.errors.push(error);
    }
}
;

/**
 * Export JSONSchemaMarkdown as a module for Node
 */
if (typeof module !== "undefined") {
    module.exports.JSONSchemaMarkdown = JSONSchemaMarkdown;
}
