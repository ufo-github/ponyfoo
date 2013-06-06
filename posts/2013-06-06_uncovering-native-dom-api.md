# Uncovering Native DOM API #

# Meet: XMLHttpRequest #

We could start by looking it up on [MDN](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest "XMLHttpRequest - MDN"). It's name is right on _one count_. It's for performing requests. But they can _manipulate any data_, not just XML. They also aren't limited to just the [HTTP protocol](http://en.wikipedia.org/wiki/Hypertext_Transfer_Protocol "Hyper Text Transfer Protocol").

_XMLHttpRequest_ is what makes AJAX sprinkle magic all over rich internet applications nowadays. They are, admitedly, _kind of hard to get right_ without looking it up, or having prepared to use them for an interview.

Still, you **must** learn this kind of browser API if you want to become a proficient web developer.

Lets give it a first try:

    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function(){
        var completed = 4;
        if(request.readyState === completed){
            if(request.status === 200){
                // do something interesting with request.responseText
            }else{
                // don't panic! handle the case where we don't receive a 200 OK
            }
        }
    };
    xnr.open('GET', '/endpoint', true);
    xhr.send(null);

You can try this in a pen I made [here](http://cdpn.io/ycgzo "Bare XMLHttpRequest"). Before we get into what I actually did in the pen, we should go over the snippet I wrote here, making sure we didn't miss anything.
