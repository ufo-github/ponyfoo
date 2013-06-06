# Uncovering Native DOM API #

JavaScript libraries such as **jQuery** serve a great purpose in enabling and _normalizing cross-browser behaviors_ of the DOM in such a way that it's possible to use the same interface to interact with many different browsers.

But they do so at a price. And that price, in the case of some developers, is having no idea what the heck the library is actually doing when we use it.

> Heck, it works! Right? Well, _no_. You should know what happens behind the scenes, in order to better _understand what you are doing_. Otherwise, you would be just [programming by coincidence](http://pragprog.com/the-pragmatic-programmer/extracts/coincidence "Programming by Coincidence - Pragmatic Bookshelf").

I'll help you explore some of the parts of the **DOM API** that are usually abstracted away behind a little neat interface in your library of choice.

# Meet: XMLHttpRequest #

Surely you know how to write AJAX requests, right? Probably omething like...

    $.ajax({
        url: '/endpoint'
    }).done(function(data){
        // do something awesome
    }).fail(function(xhr){
        // sad little dance
    });

How do we write that with _native browser-level toothless JavaScript_?

We could start by looking it up on [MDN](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest "XMLHttpRequest - MDN"). It's name is right on _one count_. It's for performing requests. But they can _manipulate any data_, not just XML. They also aren't limited to just the [HTTP protocol](http://en.wikipedia.org/wiki/Hypertext_Transfer_Protocol "Hyper Text Transfer Protocol").

_XMLHttpRequest_ is what makes AJAX sprinkle magic all over rich internet applications nowadays. They are, admitedly, **kind of hard to get right** without looking it up, or _having prepared to use them for an interview_.

Lets give it _a first try_:

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

If you also want to send some data, you should pass that to the `xhr.send`. This function actually [sends the request](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest#send() "XMLHttpRequest send - MDN") and it supports all the signatures below.

    void send();
    void send(ArrayBuffer data);
    void send(Blob data);
    void send(Document data);
    void send(DOMString? data);
    void send(FormData data);

I won't go into detail, but you'd use those signatures to send data to the server.

A sensible way to wrap our native XHR call in a reusable function might be the following:

    function ajax(url, opts){
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function(){
            var completed = 4;
            if(xhr.readyState === completed){
                if(xhr.status === 200){
                    opts.success(xhr.responseText, xhr);
                }else{
                    opts.error(xhr.responseText, xhr);
                }
            }
        };
        xhr.open(opts.method, url, true);
        xhr.send(opts.data);
    }

    ajax('/foo', { // usage
        method: 'GET',
        success: function(response){
            console.log(response);
        },
        error: function(response){
            console.log(response);
        }
    });

You might want to add _default values_ to the `method`, `success` and `error` options, maybe even use [promises](/2013/05/08/taming-asynchronous-javascript "Taming Asynchronous JavaScript"), but it should be enough to _get you going_.

Next up, events!

# Event Listeners #

Lets say you now want to attach that awesome AJAX call to one your DOM elements, that's ridiculously easy!

    $('button').on('click', function(){
        ajax( ... );
    });

Sure, you could use jQuery like your life depended on it, but this one is pretty simple to do with 'pure' JS. Lets try a reusable function from the get-go.

    function handle(eventName, callback){
        
    }

# Querying the DOM #