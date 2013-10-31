/*global respecEvents */

(function () {
    // no point in responding to hopeless browsers
    if (!("querySelector" in document)) return;

    // the meat of the wonder
    function specstatic () {
        console.log("I am specstatic!");
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
