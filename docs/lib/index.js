var $input, $output, Doc;
$(document).ready(function(){
    $input = $('#input');
    $output = $('#output');
    Doc = new JSONSchemaMarkdown();
    run();
    $input.on("input change", run);
});

function run(){
    Doc.load($input.val());
    console.log(Doc.schema);
    $output.val(Doc.generate());
    //$input.height( $input[0].scrollHeight );
    //$output.height( $output[0].scrollHeight );
}