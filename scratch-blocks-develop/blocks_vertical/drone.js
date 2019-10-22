'use strict';

goog.provide('Blockly.Blocks.control');

goog.require('Blockly.Blocks');
goog.require('Blockly.Colours');
goog.require('Blockly.ScratchBlocks.VerticalExtensions');

Blockly.Blocks['DroneEmergencyBrick'] = {
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.DRONE_EMERGENCY,
      "category": Blockly.Categories.drone,
      "extensions": ["colours_drone", "shape_statement"]
    });
  }
};


Blockly.Blocks['DroneTakeOffLandBrick'] = {
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.DRONE_TAKEOFFLAND,
      "category": Blockly.Categories.drone,
      "extensions": ["colours_drone", "shape_statement"]
    });
  }
};

Blockly.Blocks['DroneMoveUpBrick'] = {
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.DRONE_MOVEUP,
      "args0": [
        {
          "type": "input_value",
          "name": "SECONDS"
        },
        {
          "type": "input_value",
          "name": "POWER"
        }
      ],
      "category": Blockly.Categories.drone,
      "extensions": ["colours_drone", "shape_statement"]
    });
  }
};


Blockly.Blocks['DroneMoveDownBrick'] = {
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.DRONE_MOVEDOWN,
      "args0": [
        {
          "type": "input_value",
          "name": "SECONDS"
        },
        {
          "type": "input_value",
          "name": "POWER"
        }
      ],
      "category": Blockly.Categories.drone,
      "extensions": ["colours_drone", "shape_statement"]
    });
  }
};

Blockly.Blocks['DroneMoveLeftBrick'] = {
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.DRONE_MOVELEFT,
      "args0": [
        {
          "type": "input_value",
          "name": "SECONDS"
        },
        {
          "type": "input_value",
          "name": "POWER"
        }
      ],
      "category": Blockly.Categories.drone,
      "extensions": ["colours_drone", "shape_statement"]
    });
  }
};

Blockly.Blocks['DroneMoveRightBrick'] = {
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.DRONE_MOVERIGHT,
      "args0": [
        {
          "type": "input_value",
          "name": "SECONDS"
        },
        {
          "type": "input_value",
          "name": "POWER"
        }
      ],
      "category": Blockly.Categories.drone,
      "extensions": ["colours_drone", "shape_statement"]
    });
  }
};

Blockly.Blocks['DroneMoveForwardBrick'] = {
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.DRONE_MOVEFORWARD,
      "args0": [
        {
          "type": "input_value",
          "name": "SECONDS"
        },
        {
          "type": "input_value",
          "name": "POWER"
        }
      ],
      "category": Blockly.Categories.drone,
      "extensions": ["colours_drone", "shape_statement"]
    });
  }
};

Blockly.Blocks['DroneMoveBackwardBrick'] = {
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.DRONE_MOVEBACKWARD,
      "args0": [
        {
          "type": "input_value",
          "name": "SECONDS"
        },
        {
          "type": "input_value",
          "name": "POWER"
        }
      ],
      "category": Blockly.Categories.drone,
      "extensions": ["colours_drone", "shape_statement"]
    });
  }
};

Blockly.Blocks['DroneTurnLeftBrick'] = {
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.DRONE_TURNLEFT,
      "args0": [
        {
          "type": "input_value",
          "name": "SECONDS"
        },
        {
          "type": "input_value",
          "name": "POWER"
        }
      ],
      "category": Blockly.Categories.drone,
      "extensions": ["colours_drone", "shape_statement"]
    });
  }
};

Blockly.Blocks['DroneTurnRightBrick'] = {
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.DRONE_TURNRIGHT,
      "args0": [
        {
          "type": "input_value",
          "name": "SECONDS"
        },
        {
          "type": "input_value",
          "name": "POWER"
        }
      ],
      "category": Blockly.Categories.drone,
      "extensions": ["colours_drone", "shape_statement"]
    });
  }
};

Blockly.Blocks['DroneFlipBrick'] = {
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.DRONE_FLIP,
      "category": Blockly.Categories.drone,
      "extensions": ["colours_drone", "shape_statement"]
    });
  }
};


Blockly.Blocks['DronePlayLedAnimationBrick'] = {
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.DRONE_PLAYLEDANIMATION,
      "args0": [
        {
          "type": "field_dropdown",
          "name": "DROPDOWN",
          "options": [
            ["Blink green red", "Blink green"]
          ]
        }
      ],
      "category": Blockly.Categories.drone,
      "extensions": ["colours_drone", "shape_statement"]
    });
  }
};

Blockly.Blocks['DroneSwitchCameraBrick'] = {
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.DRONE_SWITCHCAMERA,
      "category": Blockly.Categories.drone,
      "extensions": ["colours_drone", "shape_statement"]
    });
  }
};
