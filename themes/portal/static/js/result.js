(function () {

  // VARS 
  var $result = $('#result');
  var $table = $('#result-table');
  var $search = $('#search');
  var $form = $search.closest('.filter-form');
  var $detail = $('#detail');
  var $loadable = $detail.find('.loadable');
  var $detailContent = $loadable.children('.loadable-content');
  var $restricted = $result.find('.restricted-data');
  var xhr = null;
  var noData = '<span class="no-data">нет данных</span>'
  var listUrl = '/portal/api/docs';
  var requests = [];
  var dt;

  // UTILS

  function scrollTo(target, duration, complete) {
    var top = target ? $(target).offset().top : 0;
    jQuery("html, body").stop().animate({
      scrollTop: top + "px"
    }, {
      duration: duration || 1000
    }, complete);
  }

  // DATATABLE

  function setDataTable () {
    dt = $table.DataTable({
      columns: [{
        data: null,
        defaultContent: '<a href="#" class="view-detail" title="Подробная информация"></a>'
      },{
        data: 'surname.value',
        title: 'Фамилия'
      },{
        data: 'firstname.value',
        title: 'Имя',
        defaultContent: noData
      },{
        data: 'secondname.value',
        title: 'Отчество',
        defaultContent: noData
      },{
        data: 'dateBirth.value',
        title: 'Дата рождения',
        defaultContent: noData
      }],
      serverSide: true,
      processing: true,
      ajax: {
        url: listUrl,
        type: 'POST',
        data: customHttpParams
      },
      pageLength: 10,
      sDom: "<'row'<'col-sm-6'f><'col-sm-6'l>r>t<'row'<'col-sm-6'i><'col-sm-6'p>>",
      rowCallback: prepareRow
    });

    $table.on('xhr.dt', function ( e, settings, json, xhr ) {
      var notPublicCount;
      if (json && json.notPublic) {
        notPublicCount = parseInt(json.notPublic);
       if (notPublicCount) {
          $restricted.find('.counter').html(notPublicCount);
          $restricted.show();
        }
      }
    });
  }

  function getUrlParams() {
    var url = location.search;
    var data = url.split('?')[1];
    if (!data) {
      return {};
    }
    var result = {};
    data = data.split('&');
    for (var i = 0; i < data.length; ++i) {
      var item = data[i].split('=');
      if (item.length === 2) {
        result[item[0]] = decodeURIComponent(item[1]);
      }
    }
    return result;
  }

  function customHttpParams (data) {
    var params = getUrlParams();
    data.claim = {
      surname: params.surname || null,
      firstname: params.firstname || null,
      secondname: params.secondname || null,
      dateBirth: params.dateBirth || null,
      militaryRank: params.rank || null,
      districtArchDoc: params.place || null
    };
  }

  function prepareRow (row, data) {
    var $row = $(row);
    $row.data('id', data._id);
    if (data.isPublic && data.isPublic.value) {
      $row.addClass('published');
    } else {
      $row.addClass('unpublished');
    }
  }

  // FORM

  function setFormValues(values, $form) {
    $form.find('.value').each(function () {
      var $value = $(this);
      setFormValue(values[$value.attr('name')], $value);
    });
  }

  function setFormValue(value, $value) {
    value = typeof value === 'string' ? $.trim(value) : '';
    $value.val(value).data('value', value);
  }

  function getFormValues($form) {
    var values = {};
    $form.find('.value').each(function () {
      var $value = $(this);
      values[$value.attr('name')] = $.trim($value.val());
    });
    return values;
  }

  function validateForm($form) {
    var $values = $form.find('.value');
    $form.find('.has-error').removeClass('has-error');
    $values.each(function () {
      var $value = $(this);
      var $attr = $value.closest('.form-group');
      var value = $.trim($value.val());
      var error = null;
      if (!value.length && ($value.hasClass('required') || $attr.hasClass('required'))) {
        error = 'Обязательное поле';
      }
      if (error) {
        $attr.addClass('has-error').find('.error-block').html(error);
      }
    });
    return !$form.find('.has-error').length;
  }

  function showDetail (data) {
    if (data) {
      $detail.modal('show');
      $detailContent.html(parseDocData(data));
    }
  }

  function parseDocData (d) {
    if (!d) {
      return '<div class="alert alert-danger">Ошибка при загрузке данных</div>';
    }
    var res = '<h1>'+ (d.title && d.title.value || '') +'</h1><div class="form form-horizontal">';
    for (var name in d) {
      if (d.hasOwnProperty(name)) {
        if (d[name] && d[name].value && d[name].name) {
          res += parseAttr(d[name].value, d[name].name, d[name].type);
        }
      }
    }
    return '<div class="detail">'+ res + '</div></div>';
  }

  function parseAttr (value, title, type) {
    if (type === 5) {
      return value && value.link
      ? parseAttr('<a href="' + value.link +'" class="btn btn-primary-filled" target="_blank">Скачать файл</a>', title)
      : '';
    }
    return !value ? '' : '<div class="form-group"><div class="col-sm-4"><label class="control-label">'
    + title + '</label></div><div class="col-sm-8"><p class="form-control-static">'
    + value + '</p></div></div>';
  }

  // INIT

  setFormValues(getUrlParams(), $form);

  $form.one('ready', function () {
    if ($form.data('validate') && validateForm($form)) {
      setDataTable();
      scrollTo($result, 1000);
    }
  });

  $table.on('click', 'tbody tr', function () {
    var $row = $(this);
    $table.find('.selected').removeClass('selected');
    $row.addClass('selected');
    showDetail(dt.row(this).data());
  });

  $table.on('click', 'tbody .view-detail', function (event) {
    event.preventDefault();
    var $row = $(this).closest('tr');
    showDetail($row.data('id'));
  });

  $('.select-placeholder').each(function () {
    var $attr = $(this).closest('.form-group');
    var $select = $attr.find('.value');
    $select.change(function () {
      $attr.toggleClass('empty', !$select.val());
    });
  });

  $('.select-relation').each(function () {
    var $attr = $(this);
    var $select = $attr.find('.value');
    requests.push(
      $.get($attr.data('url'), {
        start: 0,
        length: 100
      }).done(function (data) {
        data = data || [];
        var content = '<option></option>';
        for (var i = 0; i < data.length; ++i) {
          content += '<option value="' + data[i].id + '">' + data[i].title + '</option>';
        }
        $select.html(content).val($select.data('value')).change();
      })
    );
  });

  $.when.apply($, requests).then(function(){
    $('.filter-form').trigger('ready');
  }); 

  $(window).on("resize", function () {
    $(document.body).find('table.dataTable').DataTable().columns.adjust();
  });

})();

if ($.fn.dataTable) {
  $.extend($.fn.dataTable.defaults, {
    "paging": true,
    "scrollX": true,
    "lengthChange": false,
    "searching": false,
    "ordering": false,
    "info": true,
    "autoWidth": false,
    "sDom": "<'row'<'col-sm-6'l><'col-sm-6'>r>t<'row'<'col-sm-6'i><'col-sm-6'p>>",
    "language": {
      "processing": "Подождите...",
      "search": "Поиск:",
      "lengthMenu": "Показать по _MENU_",
      "info": "Записи с _START_ до _END_ из _TOTAL_ записей",
      "infoEmpty": "Записи с 0 до 0 из 0 записей",
      "infoFiltered": "(всего _MAX_)",
      "infoPostFix": "",
      "loadingRecords": "Загрузка записей...",
      "zeroRecords": "Данные отсутствуют",
      "emptyTable": "Данные отсутствуют",
      "paginate": {
        "first": "<<",
        "previous": "<",
        "next": ">",
        "last": ">>"
      },
      "aria": {
        "sortAscending": ": активировать для сортировки столбца по возрастанию",
        "sortDescending": ": активировать для сортировки столбца по убыванию"
      }
    }
  });
  $.fn.dataTable.ext.errMode = 'none';
}