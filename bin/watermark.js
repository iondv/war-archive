const fs = require('fs');
const path = require('path');
const PreProcessor = require('../lib/watermark-overlay/preProcessor');
const {processDirAsync} = require('core/util/read');

let imageExtentions = ['jpg', 'jpeg', 'gif', 'png', 'svg', 'raw', 'webp'];

let defaultParams = {};

try {
  defaultParams = require('./default.json');
} catch (err) {
  // Do nothing
}

let params = {
  directory: null,
  recursive: false,
  overlayPath: null,
  text: null,
  width: null,
  height: null,
  font: null,
  fontFamily: null,
  fontPath: null,
  fontName: null,
  fontSize: null,
  fontColor: null,
  configPath: null,
  pattern: false,
  ratio: null
};

let setParam = false;

process.argv.forEach((val) => {
  if (val === '--dir') {
    setParam = 'directory';
  } else if (val === '--recursive' || val === '-r') {
    params.recursive = true;
  } else if (val === '--pattern') {
    params.pattern = true;
  } else if (val === '--path') {
    setParam = 'overlayPath';
  } else if (val === '--config') {
    setParam = 'configPath';
  } else if (val === '--font-family') {
    setParam = 'fontFamily';
  } else if (val === '--font-path') {
    setParam = 'fontPath';
  } else if (val === '--font-name') {
    setParam = 'fontName';
  } else if (val === '--ratio') {
    setParam = 'ratio';
  } else if (val.substr(0, 2) === '--') {
    setParam = val.substr(2);
  } else if (setParam) {
    params[setParam] = val;
  }
});

if (!params.directory) {
  throw new Error('не указаны обязательные параметры');
}

function writeFile(filePath, data) {
  return new Promise((resolve, reject) => {
    fs.writeFile(filePath, data, err => err ? reject(err) : resolve());
  });
}

function processImages(directory) {
  return processDirAsync(directory)
    .then((files) => {
      const imgParams = Object.assign(
        defaultParams,
        {
          overlayPath: params.overlayPath,
          text: params.text,
          width: params.width,
          height: params.height,
          fontSize: params.fontSize,
          fontColor: params.fontColor,
          configPath: params.configPath,
          pattern: params.pattern
        }
      );
      if (params.fontFamily && params.fontPath) {
        imgParams.font = {
          family: params.fontFamily,
          path: params.fontPath,
          name: params.fontName || params.fontFamily
        };
      } else if (params.font) {
        imgParams.font = params.font;
      }

      const watermarkApplier = new PreProcessor(imgParams);
      let p = watermarkApplier.init();

      files.forEach((fn) => {
        const stat = fs.lstatSync(fn); // eslint-disable-line no-sync
        const ext = path.extname(fn).slice(1).toLowerCase();
        if (stat.isFile() && imageExtentions.includes(ext)) {
          p = p
            .then(() => watermarkApplier.apply(fn, {format: ext}))
            .then(
              buf => writeFile(fn, buf)
                .then(() => console.info(`Обработан файл ${fn}`))
                .catch(
                  (err) => {
                    console.err(err);
                    console.info(`Возникли проблемы с обработкой файла ${fn}`);
                  }
                )
            );
        } else if (params.recursive && stat.isDirectory()) {
          p = p.then(() => processImages(fn));
        }
      });
      return p;
    });
}

processImages(params.directory)
  .then(() => console.info('Процесс выполнен успешно'))
  .catch(err => console.error(err));
