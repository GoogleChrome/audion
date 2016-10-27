goog.provide('audion.entryPoints.injectTracing');


/**
 * The entry point for actually injecting tracing code into the page. This
 * script executes as a content script. Content scripts for Chrome extensions
 * ... are weird. They can manipulat the page DOM but execute JS in a context
 * different from that of the page. This prevents name collisions, but also
 * means that we cannot directly alter globals in the content script since the
 * page will not heed those changes. We must instead attach the code for
 * instrumenting web audio calls into script tag for execution.
 */
audion.entryPoints.injectTracing = function() {};


audion.entryPoints.injectTracing();
