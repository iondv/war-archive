const {
  produceOverlay, registerFont
} = require('./util/produce-overlay');
const {toAbsolute} = require('core/system');
const sharp = require('sharp');
const path = require('path');

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
function WatermarkOverlay(options) {

  options = options || {};

  this.init = function () {
    const {font} = options;
    if (typeof font === 'object' && font && font.family && font.path) {
      registerFont(toAbsolute(font.path), {family: font.family});
    }
    return Promise.resolve(true);
  };

  /**
   * @param {String|Buffer} imgSource
   * @param {{}} opts
   * @param {String} [opts.name]
   * @returns {Promise}
   */
  this.apply = function (imgSource, opts) {
    const fileName = opts && opts.name;
    const format = opts.format || options.format || path.extname(fileName || '').slice(1) || 'png';
    const image = sharp(imgSource);
    return image
      .metadata()
      .then(meta => produceOverlay(meta, options))
      .then(overlay => image.png()
        .overlayWith(overlay, {gravity: sharp.gravity.southeast})
        .toFormat(format.toLowerCase())
        .toBuffer()
      );
  };

}
module.exports = WatermarkOverlay;
