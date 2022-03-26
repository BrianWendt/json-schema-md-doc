var $text, $schema, $output;
$(document).ready(function () {
    $text = $('#text');
    $schema = $('#schema');
    $output = $('#output');
    run();
    $text.on("input change", run);
    $schema.on("input change", run);
    $output.focus(function () {
        $(this).select();
    });
});

function run() {
    var markdown = "**Describe Your Issue**\n";
    markdown += $text.val() + "\n\n";
    markdown += "**Schema**\n";
    var schema = $schema.val();
    try {
        var schemaObj = JSON.parse(schema);
        schema = JSON.stringify(schemaObj);
    } catch (e) {
        markdown += "Invalid JSON!!!\n";
    }
    markdown += "\n```\n" + schema + "\n```";
    $output.val(markdown);
}