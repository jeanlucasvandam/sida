/*global $, $F, storefront */

$F.ksb.nodes.CustomerEntryPage = (function () {
    "use strict";

    var api, priv;

    priv = {
        eventBinding: function () {
            $(api.config.selector.switchView).on('click', priv.switchView);
            $(window).on('resize', function () { if ( $( ".package-block-view" ).length ) { priv.resizeBoxes("list");} });
        },

        switchView: function ( e, initialSwitch ) {

            var part = $(this).data('view'),
            showClass = '.package-' + part + '-view';

            if(part == 'table') {
                $('.cep-container').removeClass('package-block-view').show();
            }
            else {
                $('.cep-container').addClass('package-block-view').show();
            }


            $('.show-view.active').removeClass('active');
            $(api.config.selector.switchView).filter(function () { return $(this).data('view') === part; }).addClass('active');

            if ( ! initialSwitch ) {
                $F.ksb.utils.cookieBakery.create(api.config.viewCookie, part);
                $( "html, body" ).animate({
                    scrollTop: $( api.config.selector.table ).offset().top - 50
                }, 500);
            }
            priv.resizeBoxes(part);
            e.preventDefault();

        },

        checkView: function (viewData) {
            if (viewData) {
                $('.show-view[data-view="' + viewData + '"]').eq(0).trigger('click', [ 1 ]);
            } else {
                var view = api.config.packageCount > 5 ? 'table' : 'list';
                $('.show-view[data-view="' + view + '"]').eq(0).trigger('click', [ 1 ]);
            }
        },
        showHilight: function () {
            $F.ksb.utils.modalWindow.close();
            window.setTimeout(function () {
                $('.hilight-package.finished:visible:first').each(function () {
                    if ( !$F.ksb.globals.hilighted ) {
                        $( "html, body" ).animate({
                            scrollTop: $( this ).offset().top - 50
                        }, 600);
                        $F.ksb.globals.hilighted = 1;
                    }

                    $F.ksb.utils.modalWindow
                        .hilight( $(this), 'allow_escape' )
                        .decorateHilight({
                            bottom: $('#bottomHelp')
                        });
                });

                $('#package-overview:visible').parent().each(function () {
                    if ( !$F.ksb.globals.hilighted ) {
                        $( "html, body" ).animate({
                            scrollTop: $( this ).offset().top - 50
                        }, 600);
                        $F.ksb.globals.hilighted = 1;
                    }

                    $F.ksb.utils.modalWindow
                        .hilight( $(this), 'allow_escape' )
                        .decorateHilight({
                            bottom: $('#bottomHelp')
                        });
                });
            }, 500);
        },
        resizeBoxes: function (view) {

            var maxHeight         = "auto",
                max_footer_height = 0,
                group             = "",
                groups            = [];

            $( '.jss_resize_cep' ).each( function() {
                group     = $(this).attr("role-group");

                if ( !group ) {
                    $( this ).attr( "role-group", "default-role-group" );
                    group = "default-role-group";
                }

                var found = $.inArray( group, groups ) > -1;
                if ( !found ) {
                    groups.push( group );
                }
            });

            $.each( groups, function( key, value ) {
                var selector          = '.jss_resize_cep' + "[role-group='" + value + "']";

                if(view != "table") {

                    if ( $(selector).prop("tagName") == "TD" || $(selector).prop("tagName") == "TR") {
                        $( selector ).css("height", "auto");
                    }
                    else {
                        $( selector ).css("min-height", auto);
                    }
                    if($(window).innerWidth() > api.config.maxCalcHeight) {
                        maxHeight = 0;

                        $( selector ).each(function () {
                            var height        = $(this).height();
                            maxHeight             = height > maxHeight ? height : maxHeight;

                        });
                        maxHeight += 5;
                    }
                }

                if ( $(selector).prop("tagName") == "TD" || $(selector).prop("tagName") == "TR") {
                    $( selector ).css("height", maxHeight);
                }
                else {
                    $( selector ).css("min-height", maxHeight);
                }

            });
        },
    };

    api = {
        config: {
            packageCount: 0,
            selector: {
                switchView : '.show-view',
                table      : '#start-switch'
            },
            boxSelector    : ".jss_resize_cep",
            viewCookie     : 'package_view',
            maxCalcHeight  : 1008
        },

        init: function (config) {
            api.config = $.extend({}, api.config, config);

            priv.eventBinding();

            var viewData = $F.ksb.utils.cookieBakery.load(api.config.viewCookie);
            priv.checkView(viewData);

            return this;
        },

        showHilight: priv.showHilight
    };

    if (storefront.globals.t === true) {
        api.INTERNAL = priv;
    }

    return api;
}());
