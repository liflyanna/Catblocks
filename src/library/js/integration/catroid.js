import '../../css/common.css';
import '../../css/catroid.css';
import 'bootstrap/dist/css/bootstrap.css';

import Blockly from 'blockly';
import 'jquery';
import 'bootstrap/dist/js/bootstrap.bundle';

import { Parser } from '../../../common/js/parser/parser';
import {
  defaultOptions,
  generateFormulaModal,
  jsonDomToWorkspace,
  parseOptions,
  createLoadingAnimation,
  buildUserDefinedBrick
} from './utils';
import { CatblocksMsgs } from '../catblocks_msgs';

export class Catroid {
  constructor() {
    this.config = {};
    this.workspace = undefined;
    this.all_blocks = new Map();
    this.scene = null;
    this.object = null;
  }

  async init(options) {
    this.config = parseOptions(options, defaultOptions.render);
    this.createModifiableWorkspace();
    generateFormulaModal();
    createLoadingAnimation();

    if (window.CatBlocks) {
      this.insertRightMediaURI();
    }
    if (this.config.rtl) {
      document.documentElement.style.direction = 'rtl';
    }
    await CatblocksMsgs.setLocale(this.config.language, this.config.i18n);

    const workspaceItem = {
      displayText: CatblocksMsgs.getCurrentLocaleValues()['SWITCH_TO_1D'],
      preconditionFn: function (scope) {
        const block = scope.block;
        if (block && block.type && block.type.endsWith('_UDB_CATBLOCKS_DEF')) {
          return 'hidden';
        }
        return 'enabled';
      },
      callback: function (scope) {
        if (scope && scope.block && scope.block.id) {
          try {
            Android.switchTo1D(scope.block.id);
          } finally {
            // ignore
          }
        }
      },
      scopeType: Blockly.ContextMenuRegistry.ScopeType.BLOCK,
      id: 'catblocks-switch-to-1d',
      weight: -5
    };
    Blockly.ContextMenuRegistry.registry.register(workspaceItem);

    // disable collapse option in context menu
    Blockly.ContextMenuRegistry.registry.unregister('collapseWorkspace');
    Blockly.ContextMenuRegistry.registry.unregister('blockCollapseExpand');

    const thisShare = this;
    Blockly.ContextMenuRegistry.registry.getItem('blockDuplicate').callback = function (scope) {
      const newId = Android.duplicateBrick(scope.block.id);
      const codeXML = Android.getCurrentProject();

      const objectJSON = Parser.convertObjectToJSON(codeXML, thisShare.scene, thisShare.object);

      const clone = objectJSON.scriptList.filter(x => x.id.toLowerCase() == newId.toLowerCase());
      if (clone && clone.length) {
        const workspace = thisShare.workspace;
        thisShare.domToSvgModifiable(clone[0], workspace);
        const oldPosition = scope.block.getRelativeToSurfaceXY();
        const newBrick = workspace.getBlockById(newId);
        if (newBrick) {
          const newX = oldPosition.x + scope.block.width;
          const newY = oldPosition.y;
          newBrick.moveBy(newX, newY);
          Android.updateScriptPosition(newId, newX, newY);
        }
      } else {
        // TODO: show error
      }
    };

    Blockly.ContextMenuRegistry.registry.getItem('blockDuplicate').preconditionFn = function (scope) {
      const block = scope.block;

      if ((block.type && block.type.endsWith('_UDB_CATBLOCKS_DEF')) || block.type === 'UserDefinedScript') {
        return 'hidden';
      }

      if (!block.isInFlyout && block.isDeletable() && block.isMovable()) {
        if (block.isDuplicatable()) {
          return 'enabled';
        }
        return 'disabled';
      }
      return 'hidden';
    };
  }

  createModifiableWorkspace() {
    let mediapath = `${this.config.shareRoot}${this.config.media}`;
    // full link or absolute path given
    if (this.config.media.startsWith('http') || this.config.media.startsWith('/')) {
      mediapath = this.config.media;
    }
    this.workspace = Blockly.inject(this.config.container, {
      readOnly: false,
      media: mediapath,
      zoom: {
        controls: false,
        wheel: false,
        pinch: true,
        startScale: this.config.renderSize
      },
      move: {
        scrollbars: true,
        drag: true,
        wheel: false
      },
      collapse: false,
      renderer: 'zelos',
      rtl: this.config.rtl,
      sounds: false
    });
    Blockly.svgResize(this.workspace);
  }

  renderObjectScripts(object) {
    if (!this.workspace) {
      throw Error('Workspace not initialized. Did you call init?');
    }

    const createdBricks = buildUserDefinedBrick(object);
    if (createdBricks) {
      createdBricks.forEach(brickName => {
        this.fixBrickMediaURI(brickName);
      });
    }

    let failed = 0;
    for (let i = 0; i < object.scriptList.length; i++) {
      if (this.domToSvgModifiable(object.scriptList[i]) === false) {
        ++failed;
        // console.log('failed to render script ' + i);
      }
    }

    if (failed > 0) {
      // TODO: Android.showMessage('Some scripts could not be rendered.');
    }

    this.workspace.cleanUp();
    const topBricks = this.workspace.getTopBlocks();
    for (let i = 0; i < object.scriptList.length; ++i) {
      const script = object.scriptList[i];
      const brick = topBricks.find(x => x.id == script.id);
      if (!brick) {
        continue;
      }

      brick.setMovable(true);

      if (script.posX !== undefined && script.posY !== undefined && (script.posX != 0 || script.posY != 0)) {
        const position = brick.getRelativeToSurfaceXY();
        brick.moveBy(Math.round(script.posX - position.x), Math.round(script.posY - position.y));
      }
    }

    this.scrollToFocusBrick();

    this.workspace.addChangeListener(event => {
      if (event.type == Blockly.Events.BLOCK_DRAG && !event.isStart) {
        const droppedBrick = this.workspace.getBlockById(event.blockId);
        const isTopBrick = droppedBrick.hat !== undefined;
        const position = droppedBrick.getRelativeToSurfaceXY();

        if (isTopBrick) {
          Android.updateScriptPosition(event.blockId, position.x, position.y);
        } else {
          const bricksToMove = [];
          for (let i = 0; i < event.blocks.length; ++i) {
            bricksToMove.push(event.blocks[i].id);
          }

          if (droppedBrick.getParent() == undefined) {
            const newEmptyBrickId = Android.moveBricksToEmptyScriptBrick(bricksToMove);
            const newEmptyBrick = this.workspace.newBlock('EmptyScript', newEmptyBrickId);
            newEmptyBrick.initSvg();
            newEmptyBrick.render();

            const newEmptyBrickSize = newEmptyBrick.getHeightWidth();
            const connectionOffset = 8;
            const newEmptyBrickPositionX = position.x;
            const newEmptyBrickPositionY = position.y - newEmptyBrickSize.height + connectionOffset;
            newEmptyBrick.moveBy(newEmptyBrickPositionX, newEmptyBrickPositionY);

            newEmptyBrick.nextConnection.connect(droppedBrick.previousConnection);
            droppedBrick.setParent(newEmptyBrick);

            Android.updateScriptPosition(newEmptyBrickId, newEmptyBrickPositionX, newEmptyBrickPositionY);

            if (newEmptyBrick.pathObject && newEmptyBrick.pathObject.svgRoot) {
              Blockly.utils.dom.addClass(newEmptyBrick.pathObject.svgRoot, 'catblockls-blockly-invisible');
            }
            this.removeEmptyScriptBricks();
          } else {
            const firstBrickInStack = droppedBrick.getTopStackBlock();
            const isFirstBrickInStack = firstBrickInStack.id.toLowerCase() == droppedBrick.id.toLowerCase();

            let subStackIdx = -1;
            if (
              isFirstBrickInStack &&
              firstBrickInStack &&
              firstBrickInStack.getParent() &&
              firstBrickInStack.getParent().inputList &&
              firstBrickInStack.getParent().inputList.length > 0
            ) {
              const subStacks = firstBrickInStack.getParent().inputList.filter(x => x.type == 3);
              for (let i = 0; i < subStacks.length; ++i) {
                if (subStacks[i].connection.targetConnection) {
                  if (subStacks[i].connection.targetConnection.sourceBlock_.id == firstBrickInStack.id) {
                    subStackIdx = i;
                    break;
                  }
                }
              }
            }
            Android.moveBricks(droppedBrick.getParent().id, subStackIdx, bricksToMove);
            this.removeEmptyScriptBricks();
          }
        }
      } else if (event.type == Blockly.Events.DELETE) {
        Android.removeBricks(event.ids);
      }
    });
  }

  scrollToFocusBrick() {
    if (this.brickIDToFocus) {
      const focusBrick = this.workspace.getBlockById(this.brickIDToFocus);
      if (focusBrick) {
        // this.workspace.centerOnBlock(this.brickIDToFocus);
        const workspacePosition = focusBrick.getRelativeToSurfaceXY();
        const pixelPosition = workspacePosition.scale(this.workspace.scale);
        // const oldPositionX = pixelPosition.x;
        // const oldPositionY = this.workspace.scrollY;
        const improvedPositionX = -1 * (pixelPosition.x - 5);
        const improvedPositionY = -1 * (pixelPosition.y - 5);
        this.workspace.scroll(improvedPositionX, improvedPositionY);
      }
    }
  }

  domToSvgModifiable(blockJSON) {
    try {
      jsonDomToWorkspace(blockJSON, this.workspace);
      // store all block inputs in a map for later use
      this.workspace.getAllBlocks().forEach(block => {
        if (!(block.id in this.all_blocks)) {
          const input_list = [];
          try {
            block.inputList[0].fieldRow.forEach(input => {
              input_list.push(input.value_);
            });
          } catch {
            console.log('Cannot load input of block!');
          }
          this.all_blocks[block.id] = input_list;
        }
      });
      return true;
    } catch (e) {
      console.error('Failed to generate SVG from workspace, properly due to unknown bricks', e);
    }
    return false;
  }

  removeEmptyScriptBricks() {
    try {
      const strBrickIDs = Android.removeEmptyScriptBricks();
      const brickIDs = JSON.parse(strBrickIDs);
      if (brickIDs) {
        for (let i = 0; i < brickIDs.length; ++i) {
          const brickToRemove = this.workspace.blockDB_[brickIDs[i]];
          if (brickToRemove) {
            this.workspace.removeBlockById(brickIDs[i]);
            brickToRemove.dispose(false);
          }
        }
      }
    } catch (e) {
      console.log(e);
    }
  }

  reorderCurrentScripts() {
    if (!this.workspace) {
      return;
    }

    this.workspace.cleanUp();

    const topBricks = this.workspace.getTopBlocks();
    for (let i = 0; i < topBricks.length; ++i) {
      Android.updateScriptPosition(topBricks[i].id, 0, 0);
    }
  }

  addBricks(bricksToAdd) {
    if (!this.workspace) {
      return;
    }
    if (!bricksToAdd || bricksToAdd.length == 0) {
      return;
    }

    const newScriptId = bricksToAdd[0].brickId.toLowerCase();

    const codeXML = Android.getCurrentProject();
    const objectJSON = Parser.convertObjectToJSON(codeXML, this.scene, this.object);
    const newScript = objectJSON.scriptList.filter(x => x.id.toLowerCase() == newScriptId);

    if (newScript && newScript.length) {
      this.domToSvgModifiable(newScript[0], this.workspace);

      const renderedBrick = this.workspace.getBlockById(newScriptId);
      if (renderedBrick) {
        const metrics = this.workspace.getMetrics();
        const topLeftPixelCoords = new Blockly.utils.Coordinate(metrics.viewLeft, metrics.viewTop);
        const topLeftWsCoords = topLeftPixelCoords.scale(1 / this.workspace.scale);
        renderedBrick.setMovable(true);
        renderedBrick.moveBy(topLeftWsCoords.x, topLeftWsCoords.y);
        const pixelWsSize = new Blockly.utils.Coordinate(metrics.viewWidth, metrics.viewHeight);
        const wsSize = pixelWsSize.scale(1 / this.workspace.scale);
        renderedBrick.moveBy(wsSize.x / 2, wsSize.y / 2);

        const scriptPos = renderedBrick.getRelativeToSurfaceXY();
        Android.updateScriptPosition(bricksToAdd[0].brickId, scriptPos.x, scriptPos.y);
      }
    }
  }

  /**
   * As we don't know the MediaURL when injecting the JS file and we cannot load
   * the custom Blocks in a later state, we have to overwrite the URLs in an ugly way here
   */
  insertRightMediaURI() {
    if (this.config.media) {
      for (const brick in Blockly.Bricks) {
        this.fixBrickMediaURI(brick);
      }
    }
  }

  fixBrickMediaURI(brickName) {
    if (Object.prototype.hasOwnProperty.call(Blockly.Bricks, brickName)) {
      const obj = Blockly.Bricks[brickName];

      for (const prop in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, prop) && prop.startsWith('args')) {
          const args = obj[prop];
          for (const arg of args) {
            if (arg.src) {
              arg.src = arg.src.replace(`${document.location.pathname}media/`, this.config.media);
            }
          }
        }
      }
    }
  }

  getBrickAtTopOfScreen() {
    const allBricks = this.workspace.getAllBlocks(true);
    const metrics = this.workspace.getMetrics();

    const topLeftPixelCoords = new Blockly.utils.Coordinate(metrics.viewLeft, metrics.viewTop);
    const topLeftWsCoords = topLeftPixelCoords.scale(1 / this.workspace.scale);

    for (const brickIdx in allBricks) {
      const brickPos = allBricks[brickIdx].getRelativeToSurfaceXY();
      if (brickPos.y >= topLeftWsCoords.y) {
        if (allBricks[brickIdx].type.endsWith('_UDB_CATBLOCKS_DEF')) {
          continue;
        }
        // top brick
        return allBricks[brickIdx].id;
      }
    }
    return '';
  }
}
