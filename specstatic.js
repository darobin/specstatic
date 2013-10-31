/*global respecEvents */

(function () {
    // no point in responding to hopeless browsers
    if (!("querySelector" in document)) return;
    
    // internal state
    var headerLink
    ,   toolTipPanel
    ;
    
    // DOM navigation and tooling
    function ancestors (ref, names, onlyFirst) {
        var res = [];
        if (typeof names === "string") names = [names];
        while (ref.parentNode && ref.parentNode.nodeType === 1) {
            if (names.indexOf(ref.parentNode.tagName.toLowerCase()) > -1) {
                if (onlyFirst) return ref.parentNode;
                res.push(ref.parentNode);
                ref = ref.parentNode;
            }
        }
        return onlyFirst ? null : res;
    }
    
    var genID = 1;
    function generateID (el) {
        if (el.hasAttribute("id")) return el.getAttribute("id");
        while (document.getElementById("specstatic-" + genID)) genID++;
        el.setAttribute("id", "specstatic-" + genID);
        return "specstatic-" + genID;
    }

    // tooltip management
    function toolTip (options) {
        if (!options.content || !options.target) return;
        var el = document.createElement("div")
        ,   pos = options.position
        ;
        el.classList.add("specstatic-tooltip");
        el.innerHTML = options.content;
        if (pos === "append") {
            el.classList.add("specstatic-append");
            options.target.appendChild(el);
        }
        else if (pos === "pointer") {
            var x = options.event.clientX - 10
            ,   y = options.event.clientY - 10
            ;
            el.classList.add("specstatic-absolute");
            el.style.top = x + "px";
            el.style.left = y + "px";
            el.style.width = (options.width || 150) + "px";
            document.body.appendChild(el);
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
        
        // does this document use sections?
        var usesSections = !!document.querySelector("section");
        
        // enhance anchors
        var ids = document.querySelectorAll("[id]");
        for (var i = 0, n = ids.length; i < n; i++) {
            var el = ids[i], elName = el.tagName.toLowerCase();
            // headers
            if (/^h[2-6]$/.test(elName)) {
                // XXX Can't Touch This
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
            
            // <dfn>
            else if (elName === "dfn") {
                el.addEventListener("click", function (ev) {
                    var content;
                    if (ev.target.specstaticContent) {
                        content = ev.target.specstaticContent;
                    }
                    else {
                        var id = ev.target.getAttribute("id")
                        ,   content = "<p style='font-weight: bold'><a href='#" + id + "'>#" + id + "</a></p>"
                        ,   refs = document.querySelectorAll("a[href='#" + id + "']")
                        ;
                        if (refs.length) {
                            var secs = {};
                            for (var j = 0, m = refs.length; j < m; j++) {
                                var ref = refs[j];
                                if (usesSections) {
                                    // XXX in here
                                    var sec = ancestor(ref, "section", true)
                                    ,   gid = generateID(sec)
                                    ;
                                    // find ancestor section element
                                    // give it ID if it doesn't have one
                                    // get title
                                }
                                else {
                                    // find preceding hN element
                                    // give it ID if it doesn't have one
                                    // get title
                                }
                                
                            }
                        }
                        else {
                            content += "<p>No references.</p>";
                        }
                        ev.target.specstaticContent = content;
                    }
                    toolTipPanel = toolTip({
                        position:   "pointer"
                    ,   event:      ev
                    ,   content:    content
                    ,   width:      200
                    });
                });
            }
        }
        document.body.addEventListener("click", function () {
            if (toolTipPanel) clearToolTip(toolTipPanel);
        });
        
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
