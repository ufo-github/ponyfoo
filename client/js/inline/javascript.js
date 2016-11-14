~function (window, document, location) {
  function inject (url) {
    const script = document.createElement(`script`)
    script.src = url
    document.body.appendChild(script)
  }

  function injector () {
    const search = location.search
    const searchQuery = search ? `&` + search.substr(1) : ``
    const searchJson = `?json&callback=taunusReady` + searchQuery
    inject(location.pathname + searchJson)
    inject(`/js/all.js`)
  }

  window.taunusReady = function (model) {
    window.taunusReady = model
  }

  if (window.addEventListener) {
    window.addEventListener(`load`, injector, false)
  } else if (window.attachEvent) {
    window.attachEvent(`onload`, injector)
  } else {
    window.onload = injector
  }
}(window, document, location)
