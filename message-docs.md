Documentation of Extension Messages 
===========================================

Since we do not use a JS compiler to enforce invariants across scripts, we 
manually document the types of messages (and their properties) sent to/from
various scripts in the extension.

```
// Indicates that a script's listeners have been set up and are ready to receive
// messages. The background script uses this message to determine when it is
// able to route messages to a script.
{
  type: 'listeners_ready'
}

// Indicates that a tab changed pages so the panel can reset.
{
  type: 'page_changed'  
}
```
