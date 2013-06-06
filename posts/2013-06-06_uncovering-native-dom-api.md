# Uncovering Native DOM API #

# Meet: XMLHttpRequest #

We could start by looking it up on [MDN](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest "XMLHttpRequest - MDN"). It's name is right on _one count_. It's for performing requests. But they can _manipulate any data_, not just XML. They also aren't limited to just the [HTTP protocol](http://en.wikipedia.org/wiki/Hypertext_Transfer_Protocol "Hyper Text Transfer Protocol").

_XMLHttpRequest_ is what makes AJAX sprinkle magic all over rich internet applications nowadays. They are, admitedly, _kind of hard to get right_ without looking it up, or having prepared to use them for an interview.

Still, you **must** learn this kind of browser API if you want to become a proficient web developer.

Lets give it a first try:

    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function(){
        var completed = 4;
        if(xhr.readyState === completed){
            if(xhr.status === 200){
                // do something interesting with xhr.responseText
            }else{
                // don't panic! handle the case where we don't receive a 200 OK
            }
        }
    };
    xhr.open('GET', '/endpoint', true);
    xhr.send(null);

You can try this in a pen I made [here](http://cdpn.io/ycgzo "Bare XMLHttpRequest"). Before we get into what I actually did in the pen, we should go over the snippet I wrote here, making sure we didn't miss anything.

The `.onreadystatechange` handler will fire every time `xhr.readyState` changes, but the only state that's really relevant is `4`, a _magic number_ that denotes an XHR request is _complete_, whatever the outcome was.

Once the request is complete, the XHR object will have it's `status` filled. If you try to access `status` _before completion_, you might [get an exception](http://stackoverflow.com/a/15623060/389745 "Why does it throw?").

Lastly, when you know the `status` of your XHR request, you can do something about it, you should use `xhr.responseText` to figure out _how to react_ to the response, probably passing that to a callback.

The request is prepared using `xhr.open`, passing the [HTTP method](http://www.w3.org/Protocols/rfc2616/rfc2616-sec9.html "HTTP/1.1 Method Definitions") in the first parameter, the resource to query in the second parameter, and a third parameter to decide whether the request should be asynchronous (`true`), or block the UI thread and make everyone cry (`false`).

