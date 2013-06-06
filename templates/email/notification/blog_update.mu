<p>
    An article has been published at <a href='{{{blog.authority}}}'>{{blog.title}}</a>. You can feast your eyes on it by following this link: <a href='{{{entry.permalink}}}'>{{entry.title}}</a>
</p>
<h1 style='padding-top: 25px;'>{{entry.title}}</h1>
<p>
    <span style='padding-right:4px;'>Tags:</span>
    {{#entry.tags}}
        <a href='{{{blog.authority}}}/search/tagged/{{.}}' style='padding-right: 4px;'>{{.}}</a>
    {{/entry.tags}}
</p>
<div style='padding: 20px; background-color: #efefef;'>
    {{{entry.brief}}}
</div>
<p style='padding-top: 25px;'>
    Use the following link to <a href='*|unsubscribe_link|*'>unsubscribe</a>.
</p>