<h1>{{entry.title}}</h1>

<p>
    An article has been published at <a href='{{{blog.authority}}}'>{{blog.title}}</a>!
</p>
<p>
    You can visit the article by following this link: <a href='{{{entry.permalink}}}'>{{entry.title}}</a>
</p>
<p>
    <a href='{{{entry.permalink}}}'>{{{entry.permalink}}}</a>
</p>
<p>
    <span style='padding-right:4px;'>Tags:</span>
    {{#entry.tags}}
        <a href='{{{blog.authority}}}/search/tagged/{{.}}' style='padding-right: 4px;'>{{.}}</a>
    {{/entry.tags}}
</p>
<div>
    {{{entry.brief}}}
</div>
<p style='padding-top: 25px;'>
    Use the following link to <a href='*|unsubscribe_link|*'>unsubscribe</a>.
</p>