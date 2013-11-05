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
            }
            ref = ref.parentNode;
        }
        return onlyFirst ? null : res;
    }
    
    // this looks up previous siblings and the previous siblings of ancestors
    function precedingAncestry (ref, names, onlyFirst) {
        var res = [];
        ref = ref.previousElementSibling ? ref.previousElementSibling : ref.parentNode;
        if (typeof names === "string") names = [names];
        while (ref && ref.nodeType === 1) {
            if (names.indexOf(ref.parentNode.tagName.toLowerCase()) > -1) {
                if (onlyFirst) return ref;
                res.push(ref);
            }
            ref = ref.previousElementSibling ? ref.previousElementSibling : ref.parentNode;
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
        el.classList.add("removeOnSave"); // for ReSpec
        if (options.hover) el.classList.add("specstatic-menu");
        el.innerHTML = options.content;
        if (pos === "append") {
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
                    ev.stopPropagation();
                    if (toolTipPanel) {
                        clearToolTip(toolTipPanel);
                        toolTipPanel = null;
                        return;
                    }
                    var content;
                    if (ev.target.specstaticContent) {
                        content = ev.target.specstaticContent;
                    }
                    else {
                        var id = ev.target.getAttribute("id")
                        ,   content = "<p><a href='#" + id + "'>#" + id + "</a></p>\n"
                        ,   refs = document.querySelectorAll("a[href='#" + id + "']")
                        ;
                        if (refs.length) {
                            var dfnData = {};
                            for (var j = 0, m = refs.length; j < m; j++) {
                                var ref = refs[j]
                                ,   backref = generateID(ref)
                                ,   gid
                                ,   h
                                ;
                                if (usesSections) {
                                    var sec = ancestors(ref, "section", true);
                                    h = sec.firstElementChild;
                                    gid = generateID(sec);
                                }
                                else {
                                    h = precedingAncestry(ref, "h2 h3 h4 h5 h6".split(" "), true);
                                    gid = generateID(h);
                                }
                                if (!dfnData[gid]) {
                                    if (/^h[2-6]$/i.test(h.tagName)) {
                                        dfnData[gid] = {
                                            title:  h.innerHTML.replace(/<(\/)?a\b/gi, "<$1span")
                                        ,   id:     gid
                                        ,   refs:   [backref]
                                        };
                                    }
                                }
                                else {
                                    dfnData[gid].refs.push(backref);
                                }
                            }
                            content += "<p>Referenced in:</p>\n<ul>\n";
                            for (var k in dfnData) {
                                if (dfnData.hasOwnProperty(k)) {
                                    var sec = dfnData[k]
                                    ,   refList = []
                                    ;
                                    for (var o = 0, p = sec.refs.length; o < p; o++) {
                                        refList.push("<a href='#" + sec.refs[o] + "'>" + (o + 1) + "</a>");
                                    }
                                    content += "<li><a href='#" + sec.id + "'>" + sec.title +
                                               "</a> <span class='specstatic-refs'>" + refList.join(", ") + "</span></li>";
                                }
                            }
                            content += "</ul>\n";
                        }
                        else {
                            content += "<p>No references.</p>\n";
                        }
                        console.log("got", id, content, refs);

                        ev.target.specstaticContent = content;
                    }
                    toolTipPanel = toolTip({
                        target:     ev.target
                    ,   position:   "append"
                    ,   content:    content
                    ,   hover:      true
                    });
                    console.log("toolTipPanel", toolTipPanel);
                });
            }
        }
        document.body.addEventListener("click", function () {
            if (toolTipPanel) clearToolTip(toolTipPanel);
            toolTipPanel = null;
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
