const {onApiError} = require('modules/portal/backend/error');
const di = require('core/di');

/**
 * @param {{}} options
 * @param {{}} options.module
 * @constructor
 */
function DocSearchApiController(options) {

  this.init = () => {
    const scope = di.context('portal');

    options.module.post('/portal/api/docs', (req, res) => {
      let offset = 0;
      let count = 0;
      if (req.body.start) {
        offset = parseInt(req.body.start);
      }
      if (req.body.length) {
        count = parseInt(req.body.length);
      }

      let claim = req.body.claim || {};
      scope.provider.getResources('docs', claim, offset, count)
        .then((resources) => {
          const result = resources.map(v => v.getData());
          res.send({
            draw: parseInt(req.body.draw),
            recordsTotal: resources.total,
            recordsFiltered: resources.total,
            notPublic: resources.notPublic,
            data: result,
            log: []
          });
        })
        .catch(err => onApiError(scope, err, res));
    });

    options.module.get('/portal/api/select/:resource', (req, res) => {
      if (['rank', 'district'].indexOf(req.params.resource) < 0) {
        return res.send([]);
      }
      scope.provider.getResources(req.params.resource, {}, 0, null)
        .then((resources) => {
          let result = resources.map((v) => {
            return {id: v.getId(), title: v.getTitle()};
          });
          res.send(result);
        })
        .catch(err => onApiError(scope, err, res));
    });
  };
}

module.exports = DocSearchApiController;
