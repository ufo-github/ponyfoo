$(function(){
    var briefConverter = Markdown.getSanitizingConverter();

    briefConverter.hooks.chain("postConversion", function (text) {
        return text.replace(/<pre>/gi, "<pre class=prettyprint>");
    });

    var brief = new Markdown.Editor(briefConverter,'-brief');

    brief.hooks.chain("onPreviewRefresh", function () {
        prettyPrint();
    });

    brief.run();

    var textConverter = Markdown.getSanitizingConverter();
    var text = new Markdown.Editor(textConverter,'-text');
    text.run();
});