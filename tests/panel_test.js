/**
 * Copyright 2017 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * @fileoverview This suite of tests verifies that the graph is correctly
 *     constructed and styled.
 * TODO(chizeng): Make the test far less dependent on visual nuances like pixel
 * dimensions. In general, the tests should be more concise by checking for
 * the correctness of specific details like nodes and connections. Also, we must
 * write more tests (We would be able to once each test is more concise.).
 */
goog.provide('audion.entryPoints.PanelTest');

goog.require('audion.entryPoints.panel');
goog.require('audion.messaging.MessageType');
goog.require('goog.testing.PropertyReplacer');
goog.require('goog.testing.jsunit');

// Used to temporarily replace properties.
var stubs;


var setUp = function() {
  stubs = new goog.testing.PropertyReplacer();

  // Disable requestAnimationFrame for now. It would add asynchronicity to this
  // test, which could flake tests.
  stubs.set(goog.global, 'requestAnimationFrame', goog.nullFunction);

  // Reset the panel as if the user just visited a new page.
  audion.entryPoints.resetPanel();
};


var tearDown = function() {
  // Bring back any replaced properties.
  stubs.reset();
};


var testNewNodesAndEdges = function() {
  // The user creates a destination node in frame 42 with ID 3.
  goog.global.acceptMessage({
    type: audion.messaging.MessageType.NODE_CREATED,
    frameId: 42,
    isOffline: false,
    nodeId: 3,
    nodeType: 'AudioDestination',
    numberOfInputs: 1,
    numberOfOutputs: 1,
    audioParamNames: [],
  });

  // The user creates a gain node in the same frame with ID 4.
  goog.global.acceptMessage({
    type: audion.messaging.MessageType.NODE_CREATED,
    frameId: 42,
    isOffline: false,
    nodeId: 4,
    nodeType: 'Gain',
    numberOfInputs: 1,
    numberOfOutputs: 1,
    audioParamNames: ['gain'],
  });

  // And then connects the gain node to the destination.
  goog.global.acceptMessage({
    type: audion.messaging.MessageType.NODE_TO_NODE_CONNECTED,
    frameId: 42,
    sourceNodeId: 4, // The gain node.
    destinationNodeId: 3, // The destination node.
    fromChannel: 0,
    toChannel: 0
  });

  // The user makes an oscillator node with ID 5.
  goog.global.acceptMessage({
    type: audion.messaging.MessageType.NODE_CREATED,
    frameId: 42,
    isOffline: false,
    nodeId: 5,
    nodeType: 'Oscillator',
    numberOfInputs: 1,
    numberOfOutputs: 1,
    audioParamNames: ['detune', 'frequency'],
  });

  // And connects the oscillator to the gain *AudioParam* of gain node 4.
  goog.global.acceptMessage({
    type: audion.messaging.MessageType.NODE_TO_PARAM_CONNECTED,
    frameId: 42,
    sourceNodeId: 5, // The oscillator node.
    destinationNodeId: 4, // The gain node.
    destinationParamName: 'gain',
    fromChannel: 0
  });

  // Validate that the panel produces the correct graph. And styles + colors it.
  assertObjectEquals({
    "cells":[
      {
        "type":"basic.Rect",
        "position":{
          "x":0,
          "y":0
        },
        "size":{
          "width":42,
          "height":37
        },
        "angle":0,
        "id":"f42n3",
        "ports":{
          "groups":{
            "in":{
              "attrs":{
                "circle":{
                  "fill":"#4CAF50",
                  "r":10,
                  "stroke":"#000000",
                  "magnet":"passive"
                }
              },
              "interactive":false,
              "position":"left",
              "label":{
                "position":{
                  "name":"bottom",
                  "args":{
                    "x":0,
                    "y":-3
                  }
                }
              }
            },
            "out":{
              "attrs":{
                "circle":{
                  "fill":"#E91E63",
                  "r":10,
                  "stroke":"#000000",
                  "magnet":"passive"
                }
              },
              "interactive":false,
              "position":"right",
              "label":{
                "position":{
                  "name":"bottom",
                  "args":{
                    "x":0,
                    "y":-3
                  }
                }
              }
            },
            "param":{
              "attrs":{
                "text":{
                  "fill":"#CFD8DC"
                },
                "circle":{
                  "fill":"#CDDC39",
                  "r":5,
                  "stroke":"#000000",
                  "magnet":"passive"
                }
              },
              "interactive":false,
              "position":"left",
              "label":{
                "position":{
                  "name":"right",
                  "args":{
                    "x":12,
                    "y":0,
                    "angle":0
                  }
                }
              }
            }
          },
          "items":[
            {
              "id":"f42n3input0",
              "group":"in",
              "attrs":{
                "text":{
                  "text":0
                }
              },
              "args":{
                "y":15
              }
            },
            {
              "id":"f42n3output0",
              "group":"out",
              "attrs":{
                "text":{
                  "text":0
                }
              }
            }
          ]
        },
        "z":1,
        "attrs":{
          "rect":{
            "fill":"#37474F",
            "rx":3,
            "ry":3,
            "stroke-width":0
          },
          "text":{
            "fill":"#fff",
            "text":"AudioDestination 3"
          }
        }
      },
      {
        "type":"basic.Rect",
        "position":{
          "x":0,
          "y":0
        },
        "size":{
          "width":42,
          "height":49
        },
        "angle":0,
        "id":"f42n4",
        "ports":{
          "groups":{
            "in":{
              "attrs":{
                "circle":{
                  "fill":"#4CAF50",
                  "r":10,
                  "stroke":"#000000",
                  "magnet":"passive"
                }
              },
              "interactive":false,
              "position":"left",
              "label":{
                "position":{
                  "name":"bottom",
                  "args":{
                    "x":0,
                    "y":-3
                  }
                }
              }
            },
            "out":{
              "attrs":{
                "circle":{
                  "fill":"#E91E63",
                  "r":10,
                  "stroke":"#000000",
                  "magnet":"passive"
                }
              },
              "interactive":false,
              "position":"right",
              "label":{
                "position":{
                  "name":"bottom",
                  "args":{
                    "x":0,
                    "y":-3
                  }
                }
              }
            },
            "param":{
              "attrs":{
                "text":{
                  "fill":"#CFD8DC"
                },
                "circle":{
                  "fill":"#CDDC39",
                  "r":5,
                  "stroke":"#000000",
                  "magnet":"passive"
                }
              },
              "interactive":false,
              "position":"left",
              "label":{
                "position":{
                  "name":"right",
                  "args":{
                    "x":12,
                    "y":0,
                    "angle":0
                  }
                }
              }
            }
          },
          "items":[
            {
              "id":"f42n4input0",
              "group":"in",
              "attrs":{
                "text":{
                  "text":0
                }
              },
              "args":{
                "y":15
              }
            },
            {
              "id":"f42n4output0",
              "group":"out",
              "attrs":{
                "text":{
                  "text":0
                }
              }
            },
            {
              "id":"f42n4$param$gain",
              "group":"param",
              "attrs":{
                "text":{
                  "text":"gain"
                }
              },
              "args":{
                "y":34
              }
            }
          ]
        },
        "z":2,
        "attrs":{
          "rect":{
            "fill":"#3F51B5",
            "rx":3,
            "ry":3,
            "stroke-width":0
          },
          "text":{
            "fill":"#fff",
            "text":"Gain 4",
            "ref-x":12,
            "ref-y":9,
            "text-anchor":"left",
            "y-alignment":"top",
            "x-alignment":"left"
          }
        }
      },
      {
        "type":"devs.Link",
        "id":"f42n4output0|f42n3input0",
        "source":{
          "id":"f42n4",
          "port":"f42n4output0"
        },
        "target":{
          "id":"f42n3",
          "port":"f42n3input0"
        },
        "router":null,
        "connector":{
          "name":"rounded"
        },
        "z":3,
        "attrs":{
          ".marker-target":{
            "d":"M 10 0 L 0 5 L 10 10 z"
          }
        }
      },
      {
        "type":"basic.Rect",
        "position":{
          "x":0,
          "y":0
        },
        "size":{
          "width":42,
          "height":63
        },
        "angle":0,
        "id":"f42n5",
        "ports":{
          "groups":{
            "in":{
              "attrs":{
                "circle":{
                  "fill":"#4CAF50",
                  "r":10,
                  "stroke":"#000000",
                  "magnet":"passive"
                }
              },
              "interactive":false,
              "position":"left",
              "label":{
                "position":{
                  "name":"bottom",
                  "args":{
                    "x":0,
                    "y":-3
                  }
                }
              }
            },
            "out":{
              "attrs":{
                "circle":{
                  "fill":"#E91E63",
                  "r":10,
                  "stroke":"#000000",
                  "magnet":"passive"
                }
              },
              "interactive":false,
              "position":"right",
              "label":{
                "position":{
                  "name":"bottom",
                  "args":{
                    "x":0,
                    "y":-3
                  }
                }
              }
            },
            "param":{
              "attrs":{
                "text":{
                  "fill":"#CFD8DC"
                },
                "circle":{
                  "fill":"#CDDC39",
                  "r":5,
                  "stroke":"#000000",
                  "magnet":"passive"
                }
              },
              "interactive":false,
              "position":"left",
              "label":{
                "position":{
                  "name":"right",
                  "args":{
                    "x":12,
                    "y":0,
                    "angle":0
                  }
                }
              }
            }
          },
          "items":[
            {
              "id":"f42n5input0",
              "group":"in",
              "attrs":{
                "text":{
                  "text":0
                }
              },
              "args":{
                "y":15
              }
            },
            {
              "id":"f42n5output0",
              "group":"out",
              "attrs":{
                "text":{
                  "text":0
                }
              }
            },
            {
              "id":"f42n5$param$detune",
              "group":"param",
              "attrs":{
                "text":{
                  "text":"detune"
                }
              },
              "args":{
                "y":34
              }
            },
            {
              "id":"f42n5$param$frequency",
              "group":"param",
              "attrs":{
                "text":{
                  "text":"frequency"
                }
              },
              "args":{
                "y":48
              }
            }
          ]
        },
        "z":4,
        "attrs":{
          "rect":{
            "fill":"#009688",
            "rx":3,
            "ry":3,
            "stroke-width":0
          },
          "text":{
            "fill":"#fff",
            "text":"Oscillator 5",
            "ref-x":12,
            "ref-y":9,
            "text-anchor":"left",
            "y-alignment":"top",
            "x-alignment":"left"
          }
        }
      },
      {
        "type":"devs.Link",
        "id":"f42n5output0|f42n4$param$gain",
        "source":{
          "id":"f42n5",
          "port":"f42n5output0"
        },
        "target":{
          "id":"f42n4",
          "port":"f42n4$param$gain"
        },
        "router":null,
        "connector":{
          "name":"rounded"
        },
        "z":5,
        "attrs":{
          ".marker-target":{
            "d":"M 10 0 L 0 5 L 10 10 z"
          }
        }
      }
    ]
  }, audion.entryPoints.getGraphJsonRepresentation());
};

// TODO: Test disconnect.

// TODO: Test that 2 calls to connect only make 1 edge.

// TODO: Tests connect when the channel values are invalid (a real case that we
// have encountered).
