Documentation of Extension Messages 
===========================================

Since we do not use a JS compiler to enforce invariants across scripts, we 
manually document the types of messages (and their properties) sent to/from
various scripts in the extension.

Messages from the injected page have an additional `tag: 'webAudioExtension'`
property to ID those messages as coming from the extension.

Most messages (the ones related to updating the audio graph) from the bg script
to the dev panel have a `frameId` field to indicate which frame they stem from.

```
// Indicates a new edge from an AudioNode (to an AudioNode or an AudioParam).
{
  type: 'add_edge',
  sourceId: {number}, // The ID of the source node.
  destId: {number}, // The ID of the destination node.
  audioParam: {string=} // The name of the param connected do. Undefined if NA.
}


// Indicates that a script's listeners have been set up and are ready to receive
// messages. The background script uses this message to determine when it is
// able to route messages to a script.
{
  type: 'listeners_ready'
}


// Indicates the creation of a new AudioContext. Context IDs are unique within a
// frame.
{
  type: 'new_context',
  contextId: {number}
}


// Indicates the removal of either one edge or all edges from a node.
{
  type: 'remove_edge',
  sourceId: {number}, // The ID of the source node we are disconnecting.
  // NOTE: If destId is empty or falsy, the message indicates the removal of all
  // edges emanating from the source node.
  destId: {number}, // The ID of the destination node we disconnect from.
  audioParam: {string=} // The name of the param we disconnected from if any.
}


// Indicates that a tab changed pages so the panel can reset.
{
  type: 'page_changed'  
}
```
