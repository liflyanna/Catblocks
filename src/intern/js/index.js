import '../css/style.css';
import { Playground } from './playground/playground';
import * as shareUtils from '../../library/js/integration/utils';
import Blockly from 'blockly';
import { CatBlocks } from '../../library/js/lib_share';
import { CatBlocks as CatroidCatBlocks } from '../../library/js/lib_catroid';
import { Parser } from '../../common/js/parser/parser';
import { initShareAndRenderPrograms } from './render/utils';
import $ from 'jquery';
import { CatblocksMsgs } from '../../library/js/catblocks_msgs';

(async () => {
  if (process.env.NODE_ENV === 'development') {
    window.Blockly = Blockly;
  }

  let language = 'en';
  let isRtl = false;
  if (process.env.DISPLAY_LANGUAGE !== undefined && process.env.DISPLAY_LANGUAGE.length > 0) {
    language = process.env.DISPLAY_LANGUAGE;
  }
  if (process.env.DISPLAY_RTL !== undefined && process.env.DISPLAY_RTL.toLowerCase() === 'true') {
    isRtl = true;
  }

  switch (process.env.TYPE) {
    case 'playground': {
      await CatblocksMsgs.setLocale(language);
      const app = new Playground();
      app.init();
      break;
    }
    case 'render': {
      const programPath = 'assets/programs/';
      await initShareAndRenderPrograms(programPath, {
        renderSize: 0.75,
        shareRoot: '',
        media: 'media/',
        language: language,
        rtl: isRtl,
        i18n: 'i18n/',
        noImageFound: 'No_Image_Available.jpg',
        renderScripts: true,
        renderLooks: true,
        renderSounds: true,
        readOnly: true
      });
      break;
    }
    case 'ghpages': {
      const programPath = 'assets/programs/';
      await initShareAndRenderPrograms(programPath, {
        renderSize: 0.75,
        shareRoot: 'Catblocks/develop/',
        media: 'media/',
        language: language,
        rtl: isRtl,
        i18n: 'i18n/',
        noImageFound: 'No_Image_Available.jpg',
        renderScripts: true,
        renderLooks: true,
        renderSounds: true,
        readOnly: true
      });
      break;
    }
    case 'testing': {
      await CatblocksMsgs.setLocale(language);

      await CatBlocks.init({
        container: 'share',
        renderSize: 0.75,
        shareRoot: '',
        media: 'media/',
        language: language,
        rtl: isRtl,
        noImageFound: 'No_Image_Available.jpg'
      });
      const playground = new Playground();

      playground.workspace = Blockly.inject('playworkspace', {
        media: '../media/',
        zoom: { startScale: 0.75 },
        toolbox: playground.getToolbox(true),
        renderer: 'zelos'
      });

      const share = CatBlocks.getInstance().share;
      const toolbox = Blockly.Workspace.getAll().find(
        ws => ![share.workspace.id, playground.workspace.id].includes(ws.id)
      );

      await CatroidCatBlocks.init({
        container: 'catroid',
        renderSize: 0.75,
        language: language,
        shareRoot: '',
        media: 'media/',
        noImageFound: 'No_Image_Available.jpg',
        renderLooks: false,
        renderSounds: false,
        readOnly: false
      });

      window.$ = $;
      window.Test = {
        Playground: playground,
        Blockly: Blockly,
        CatblocksMsgs: CatblocksMsgs,
        CatBlocks: CatBlocks,
        Share: share,
        ShareUtils: shareUtils,
        Toolbox: {
          workspace: toolbox
        },
        Parser: Parser,
        CatroidCatBlocks: CatroidCatBlocks
      };
      break;
    }
    default: {
      console.warn(`Please set process.env.TYPE properly in package.json, current value: ${process.env.TYPE}`);
    }
  }
})();
