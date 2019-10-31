/*global $, $F*/
if ( JSON.parse && window.localStorage ) {
    var storage = JSON.parse(window.localStorage.getItem('tablesorter-pager'));
    if ( storage ) {
        for ( var key in storage["/apps/CustomerService"] ) {
            if ( storage["/apps/CustomerService"][key] && storage["/apps/CustomerService"][key].size ) {
                 if ( ! new RegExp(/^(6|12|24|48|1000)$/).test( storage["/apps/CustomerService"][key].size ) ) {
                    storage["/apps/CustomerService"][key].size = 6;
                }
            }
        }
    }

    window.localStorage.setItem('tablesorter-pager', JSON.stringify(storage || {}));
}

$F.ksb.utils.tableNavigation = (function () {
    "use strict";

    var api, priv;

    priv = {
        initialFilter: true,
        eventBinding: function () {
             $('.tablesorter-childRow td').hide();
             $('.tablesorter').on('click', '.tablesorter-hasChildRow .toggle', function () {
                $(this)
                    .closest('tr')
                    .nextUntil('tr:not(.tablesorter-childRow)')
                    .find('td')
                    .toggle();
                $(this).toggleClass('expanded');

                return false;
            });
        },

        getWidgetList: function () {
            var widgets = [],
                list    = api.config.widgets,
                widget;

            for ( widget in list ) {
                var state = list[ widget ];
                if ( state ) { widgets.push( widget ); }
            }

            return widgets;
        },

        getHeaders: function () {
            var headers = {};

            for ( var entry in api.config.dontSortMe ) {
                var column = api.config.dontSortMe[ entry ];

                headers[column] = {
                    sorter: false
                };
            }

            return headers;
        },

        setPageSize: function () {
            $( api.config.selector.pagesize ).selectpicker({
                style: api.config.dropdownStyle
            });
            $( api.config.selector.pagesize ).selectpicker("render");
        },

        setupTablesorter: function () {
            var selector = api.config.selector;

            $( selector.filter ).attr( 'placeholder', api.config.filterPlaceholder );

            $( selector.table )
                .tablesorter({
                    initialized: function(){
                        $('.popover-tooltip').popover({
                            placement: 'auto bottom',
                            container: 'body',
                            html: true,
                            trigger: 'click',
                            content: function () {
                                return $(this).next('.popover-content').html();
                            }
                        });
                    },
                    widgets        : priv.getWidgetList(),
                    widgetOptions  : {
                        filter_external      : selector.filter,
                        filter_columnFilters : false,
                        filter_childRows     : true
                    },
                    headers        : priv.getHeaders(),
                    /*widthFixed     : true,*/
                    withoutPager   : true,
                    textExtraction : function ( node ) {
                        return node.getAttribute( 'data-sortValue' ) || node.innerHTML;
                    }
                })
                .tablesorterPager({
                    output        : api.config.pagerLayout,
                    container     : $( selector.pager ),
                    positionFixed : false,
                    savePages     : true,
                    size: 6,
                })
                .on('pageMoved filterEnd sortEnd', function () {
                    if ( api.config.uncheckOnChange ) {
                        $('input[type="checkbox"]', selector.table).prop('checked', false);
                    }

                    api.config.onChange();
                })
                .on('pageMoved', function () {
                    // rerender multiple selects
                    $( selector.pagesize ).selectpicker( 'render' );

                    $( "html, body" ).stop( true, true ).animate({
                        scrollTop: $( selector.navitarget ).offset().top - 10
                    }, 500);
                })
                .on('filterEnd', function () {
                    if ( priv.initialFilter ) {
                        priv.initialFilter = false;
                        return;
                    }

                    var filter = $('.filter-table ').val();
                    $('.tablesorter-childRow').not('.filtered').each(function () {
                        var $this = $(this),
                            searchRE = new RegExp(filter);

                        $this[ searchRE.test( $this.text() ) ? 'removeClass' : 'addClass']('hidden');

                        if ( filter === '' ) {
                            $( selector.table ).find( '.tablesorter-hasChildRow' )
                                .find('.expanded').trigger('click');
                        } else {
                            $( selector.table ).find( '.tablesorter-hasChildRow' )
                                .not( $this.prevAll('.tablesorter-hasChildRow:visible') )
                                .find('.expanded').trigger('click');
                        }

                        // show hidden hits
                        $(this)
                            .prev('.tablesorter-hasChildRow')
                            .find('.collapsible a')
                            .not('.expanded')
                            .trigger('click');
                    });
                });

            priv.setPageSize();
        }
    };

    api = {
        config: {
            table: '',
            selector: {
                switchView : '.show-view',
                filter     : '.filter-table',
                pager      : '.paging',
                pagesize   : '.pagesize.selectpicker',
                navitarget : '.table-navigation:first'
            },
            widgets: {
                saveSort : 1,
                zebra    : 1,
                filter   : 1
            },
            dontSortMe        : [],
            dropdownStyle     : 'btn-default',
            pagerLayout       : '<span class="visible-xs-inline visible-sm-inline">{page} / {totalPages}</span><span class="hidden-xs hidden-sm">{startRow} - {endRow} / {filteredRows}</span>',
            filterPlaceholder : 'Filter',
            onChange          : function () {},
            uncheckOnChange   : true
        },

        init: function (config) {
            api.config                = $.extend( true, {}, api.config, config );
            api.config.selector.table = api.config.table;

            var table_selector = api.config.selector.table;

            if ( !table_selector || ( typeof table_selector !== 'string' ) ) {
                throw "tableNavigation::init - missing table selector";
            }

            priv.setupTablesorter();
            priv.eventBinding();
        }
    };

    if ($F.globals.t === true) {
        api.INTERNAL = priv;
    }

    return api;
}());
