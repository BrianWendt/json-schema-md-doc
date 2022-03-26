var $input, $output, $download, Doc;
$(document).ready(function(){
    $input = $('#input');
    $output = $('#output');
    $download = $('#download');
    Doc = new JSONSchemaMarkdown();
    run();
    $input.on("input change", run);
    $output.focus(function () {
        $(this).select();
    });
});

function run(){
    Doc.load($input.val());
    $output.val(Doc.generate());
    if(Doc.schema !== null){
        var href = "data:text/plain;charset=utf-8," + encodeURIComponent(Doc.markdown);
        var download = (typeof Doc.schema["$id"] === "string") ? Doc.schema["$id"] + '.md' : 'README.md';
        $download.attr('href', href).attr('download', download).removeClass('d-none');    
    } else {
        $download.addClass("d-none");
    }
    //$input.height( $input[0].scrollHeight );
    //$output.height( $output[0].scrollHeight );
}