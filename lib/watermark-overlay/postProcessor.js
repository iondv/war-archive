const {
  produceOverlay, registerFont
} = require('./util/produce-overlay');
const {toAbsolute} = require('core/system');
const sharp = require('sharp');

/**
 * @param {{}} options
 * @param {String} options.text
 * @param {String} options.width
 * @param {Number} options.height
 * @param {String} options.font
 * @param {String} options.fontSize
 * @param {Number} options.fontColor
 * @param {String} options.overlayPath
 * @constructor
 */
function WatermarkOverlayStream(options) {

  options = options || {};

  this.init = function () {
    const {font} = options;
    if (typeof font === 'object' && font && font.family && font.path) {
      registerFont(toAbsolute(font.path), {family: font.family});
    }
    return Promise.resolve(true);
  };

  /**
   * @param {Stream} imgStream
   * @returns {Promise}
   */
  this.apply = function (imgStream) {
    if (!options.acceptStream) {
      return Promise.resolve(imgStream);
    }
    return new Promise((resolve, reject) => {
      try {
        let image = sharp();
        image
          .metadata()
          .then(meta => produceOverlay(meta, options))
          .then((overlay) => {
            const overlayStream = image
              .png()
              .overlayWith(overlay, {gravity: sharp.gravity.southeast});
            return resolve(overlayStream);
          })
          .catch(err => reject(err));
        imgStream.on('error', err => reject(err));
        imgStream.pipe(image);
      } catch (err) {
        reject(err);
      }
    });
  };

}
module.exports = WatermarkOverlayStream;
