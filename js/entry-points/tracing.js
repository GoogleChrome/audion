goog.provide('audion.entryPoints.tracing');


/**
 * The entry point for tracing (ie detecting) web audio API calls. Suppress
 * type-checking for this function - it does crazy stuff with prototype
 * overrides that makes the compiler go AHHH!.
 *
 * This JS runs once in every window or frame.
 *
 * @suppress {checkTypes}
 */
audion.entryPoints.tracing = function() {};


audion.entryPoints.tracing();
