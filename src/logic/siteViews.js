var pagedown = require('pagedown'),
    fs = require('fs'),
    path = require('path');

function getProfile(req){
    var connected = req.user !== undefined,
        blogger = connected ? req.user.blogger : false;

    if(typeof req.blog === 'string'){
        return req.blog;
    }

    if(connected){
        return blogger ? 'blogger' : 'registered';
    }else{
        return 'anon';
    }
}

function render(req,res){
    var profile, view, viewModel, locals, json,
        connected = req.user !== undefined,
        profile = getProfile(req);

    if(typeof req.blog === 'string'){
        view = profile + '/__layout.jade';
    }else{
        view = 'slug/__' + profile + '.jade';
        locals = {
            id: connected ? req.user._id : undefined,
            blogger: profile === 'blogger',
            profile: profile,
            connected: connected,
            site: {
                title: req.blog.title,
                thumbnail: req.blog.thumbnail
            }
        };
        json = '!function(a){a.locals=' + JSON.stringify(locals) + ';}(window);';
        res.locals.assetify.js.add(json, 'before');
    }
    viewModel = {
        query: req.query, // query string parameters
        profile: profile,
        slug: req.slug,
        blog: req.blog,
        blogger: req.blogger
    };
    prepare(req,res,viewModel,locals);
    res.render(view, viewModel);
}

function prepare(req,res,viewModel,locals){
    var connected = req.user !== undefined,
        pd = new pagedown.getSanitizingConverter();

    if (connected && typeof req.blog !== 'string'){
        var description = req.blog.description || 'Welcome to my personal blog!',
            html = pd.makeHtml(description);

        req.blog.descriptionHtml = html;
    }

    if (viewModel.profile === 'dormant'){
        viewModel.md = {
            env: readMarkdown('../../ENV.md'),
            tags: readMarkdown('../../TAGS.md')
        };
    }

    function readMarkdown(file){
        var absolute = path.resolve(__dirname, file),
            file = fs.readFileSync(absolute);

        return pd.makeHtml(file.toString());
    }
}

module.exports = {
    render: render
}