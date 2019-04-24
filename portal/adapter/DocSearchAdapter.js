const ResourceAdapter = require('modules/portal/lib/interfaces/ResourceAdapter');
const Resource = require('modules/portal/lib/interfaces/Resource');
const F = require('core/FunctionCodes');

/**
 *
 * @param {{}} options
 * @param {DataRepository} options.dataRepo
 * @param {String} options.className
 * @constructor
 */
function DocSearchAdapter(options) {
  if (!options.dataRepo) {
    throw new Error('DocSearchAdapter: не указан репозиторий данных.');
  }

  const className = options.className || 'basicArchDoc@khv-archive-vov';

  /**
   * @param {{}} data
   * @param {Item} item
   * @constructor
   */
  function IDocResource(data, item) {
    this._id = () => item ? item.getItemId() : null;

    this._title = () => item ? item.toString() : null;

    this._date = () => item ? item.get('dateCreate') : null;

    this._content = () => '';

    this.getData = () => data || {};
  }

  IDocResource.prototype = new Resource();

  const filterAttrs = ['surname', 'firstname', 'secondname', 'dateBirth', 'militaryRank', 'districtArchDoc'];
  const publicAttrs = options.publicAttrs || filterAttrs;
  const notPublicAttrs = options.notPublicAttrs || filterAttrs;

  /**
   *
   * @param {{}} opts
   * @param {{}} [opts.filter]
   * @param {{}} [opts.sort]
   * @param {Number} [offset]
   * @param {Number} [count]
   * @return {Promise.<Resource[]>}
   * @private
   */
  this._getResources = (opts, offset, count) => {
    try {
      if (!opts.surname || !opts.firstname) {
        return Promise.resolve([]);
      }
      const result = [];
      const filter = {[F.AND]: []};
      filterAttrs.forEach((name, i) => {
        if (opts[name]) {
          let operation = i > 2 ? F.EQUAL : F.LIKE;
          filter[F.AND].push({[operation]: ['$' + name, opts[name]]});
        }
      });
      const listOptions = {
        filter,
        count: count || 10,
        offset: offset || 0,
        countTotal: true
      };
      return options.dataRepo.getList(className, listOptions)
        .then((items) => {
          let notPublicCount = 0;
          if (Array.isArray(items) && items.length) {
            items.forEach((i) => {
              let data = {
                isPublic: {value: i.get('isPublic')},
                title: {value: i.get('__classTitle')}
              };
              if (!data.isPublic.value) {
                notPublicCount++;
              }
              let attrs = data.isPublic.value ? publicAttrs : notPublicAttrs;
              attrs.forEach((attr) => {
                // const pm = i.getMetaClass().getPropertyMeta(attr.split('.')[0]);
                const property = i.property(attr);
                if (property) {
                  data[attr] = {
                    value: property.getDisplayValue(attr),
                    name: property.getCaption(),
                    type: property.getType()
                  };
                }
              });
              result.push(new IDocResource(data, i));
            });
          }
          result.total = items.total;
          result.notPublic = notPublicCount;
          return result;
        });
    } catch (err) {
      return Promise.reject(err);
    }
  };

  /**
   * @param {String} id
   */
  this.getResource = id => options.dataRepo.getItem(className, id, {})
    .then(item => item ? new IDocResource(item) : null);
}

DocSearchAdapter.prototype = new ResourceAdapter();
module.exports = DocSearchAdapter;
