<div itemprop='action' itemscope itemtype='http://schema.org/ViewAction'>
    <meta itemprop='name' content='View Comment'/>
    <a itemprop='url' href='{{{entry.permalink}}}'>
        <h1>{{entry.title}}</h1>
    </a>
</div>
<p style='background-color: #FFF; padding: 8px; border-bottom: 2px solid #e92c6c;'>
    <a href='{{{commenter.profile}}}'>
        <img src='cid:gravatar' alt='' style='vertical-align: middle;' />
        <span> {{commenter.displayName}}</span>
    </a>
    <span> added a comment!</span>
</p>
<div style='padding: 20px; background-color: #efefef;'>
    {{{comment}}}
</div>
<p>
    Reply using <a href='{{{thread.permalink}}}'>this link</a>.
</p>