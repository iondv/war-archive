ymaps.ready(function () {
  var $map = $('#map');
  var ymap = new ymaps.Map($map.get(0), {
    center: [135.08379, 48.48272],
    zoom: 13,
    controls: ['zoomControl' ]
  },{
    suppressMapOpenBlock: true
  });
  var placemark = new ymaps.Placemark([135.0772281, 48.4865744], {}, {
    iconLayout: 'default#image',
    iconImageHref: $map.data('placemark'),
    iconImageSize: [354, 220],
    iconImageOffset: [-175, -220]
  });
  ymap.geoObjects.add(placemark);
  ymap.setCenter([135.08379, 48.495]);
});
