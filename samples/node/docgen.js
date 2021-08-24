const {JSONSchemaMarkdown} = require('../../docs/lib/JSONSchemaMarkdown');
const fs = require("fs");
const package = require("../../package.json");
var path = require('path');

var { argv } = require("yargs")
   .scriptName("OpenMetadataJsonDoc")
   .usage("Usage: $0 -i inputDirectory -o outputDirectory")
   .option("i", {
       alias: "inputDirectory",
       describe: "Directory that has JSON schemas.",
       demandOption: "Input directory is required.",
       type: "string",
       nargs: 1,
     })
   .option("o", {
       alias: "outputDirectory",
       describe: "Directory where markdown generated from JSON schemas needs to be stored.",
       demandOption: "Output directory is required.",
       type: "string",
       nargs: 1,
     })
     .describe("help", "Show help.");


class OpenMetadataJsonDoc extends JSONSchemaMarkdown {
    constructor(){
        super();
    }

    typeGeneric(name, data, level, path) {
        this.writeHeader(data.title, level, path);
        this.writeDescription(data.description, level, path);
        this.writeRef(data["$ref"], level, path);
        this.writeId(data["$id"], level, path);
        this.writeType(data.type, level, path);
        this.writeExamples(data.examples, level, path);
        this.writeEnum(data.enum, level);
        this.writeDefault(data.default, level, path);
    }
};

const DocGen = new OpenMetadataJsonDoc();
const { inputDirectory, outputDirectory } = argv;

function getAllFiles(dirPath) {
fs.readdirSync(dirPath).forEach(function(file) {
    let filepath = path.join(dirPath , file);
    let stat= fs.statSync(filepath);
    if (stat.isDirectory()) {
        getAllFiles(filepath);
    } else {
        if (path.extname(filepath) == ".json") {
            var json = fs.readFileSync(filepath).toString();
            DocGen.load(json);
            DocGen.generate();
            if(DocGen.errors.length > 0){
                console.log('errors', DocGen.errors);
            } else {
                var outputFile = outputDirectory + "/" + path.relative(inputDirectory, filepath).replace(".json", ".md");
                console.log(path.dirname(outputFile));
                if (!fs.existsSync(path.dirname(outputFile))){
                    fs.mkdirSync(path.dirname(outputFile));
                }
                console.log(outputFile);
                fs.writeFile(outputFile, DocGen.markdown, function(err){
                    console.log(err || "No errors writing " + outputFile);
                });
            }
        }
    }
});
}
getAllFiles(inputDirectory);
