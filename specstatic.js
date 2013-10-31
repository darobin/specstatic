/*global respecEvents */

(function () {
    // no point in responding to hopeless browsers
    if (!("querySelector" in document)) return;
    
    var headerLink
    ;

    // tooltip management
    function toolTip (options) {
        if (!options.content || !options.target) return;
        var el = document.createElement("div");
        el.classList.add("specstatic-tooltip");
        el.innerHTML = options.content;
        if (options.position === "append") {
            el.classList.add("specstatic-append");
            options.target.appendChild(el);
        }
        return el;
    }
    
    function clearToolTip (el) {
        el.parentNode.removeChild(el);
    }

    // the meat of the wonder
    function specstatic () {
        // find ourselves and inject CSS to match
        var src = document.currentScript ? document.currentScript.src : null;
        if (!src) {
            var scripts = document.querySelectorAll("script[src]");
            for (var i = 0, n = scripts.length; i < n; i++) {
                var s = scripts[i]
                ,   tmpSrc = s.getAttribute("src")
                ;
                if (!/specstatic(\.min)?\.js$/.test(tmpSrc)) continue;
                src = tmpSrc;
                break;
            }
        }
        src = src.replace(/\.js$/, ".css");
        var lnk = document.createElement("link");
        lnk.setAttribute("href", src);
        lnk.setAttribute("rel", "stylesheet");
        document.head.appendChild(lnk);
        
        // enhance anchors
        var ids = document.querySelectorAll("[id]");
        for (var i = 0, n = ids.length; i < n; i++) {
            var el = ids[i];
            if (/^h[2-6]$/i.test(el.tagName)) {
                el.addEventListener("mouseenter", function (ev) {
                    var id = ev.target.getAttribute("id");
                    headerLink = toolTip({
                        target:     ev.target
                    ,   position:   "append"
                    ,   content:    "<a href='#" + id + "' class='specstatic-anchorlink'>§</a>"
                    });
                });
                el.addEventListener("mouseleave", function () {
                    clearToolTip(headerLink);
                });
            }
        }
    }
    
    // trigger load either after ReSpec if present, or when we have the DOM
    if ("respecEvents" in window) {
        if (document.respecDone) return specstatic();
        respecEvents.sub("end-all", specstatic);
    }
    else {
        document.addEventListener("DOMContentLoaded", specstatic);
    }
}());
