/*global window, $, $F, Math, i18n */

$F.ksb.utils.helper = {
    /**
    *
    * Check if a given element is in the current viewport.
    *
    * @param {jQ-Object} $element   The element which you want to check.
    * @param {boolean} fullView     Default value is true so the element have to be full visible
    *                               false returns always true as long as a little part is visible.
    *
    * @return {Object}              Port and direction with boolean values.
    */
    inView: function ($element, fullView) {
        'use strict';

        var bottom,
            top,
            right,
            left,
            width = 0,
            height = 0;

        fullView = fullView || true;

        if (fullView) { // if u wish to see the whole element
            width   = $element.width();
            height  = $element.height();
        }

        bottom  = ($(window).height() + $(window).scrollTop()) <= $element.offset().top + height;
        top     = $(window).scrollTop() >= $element.offset().top + $element.height() - height;
        right   = ($(window).width() + $(window).scrollLeft()) <= $element.offset().left + width;
        left    = $(window).scrollLeft() >= $element.offset().left + $element.width() - width;

        return {
            port:   !right && !left && !bottom && !top,
            right:  !right,
            left:   !left,
            top:    !top,
            bottom: !bottom
        };
    },

    /**
    *
    * Shrink a given string and replace the middle width '[...]'.
    * If the given param is a jQ-Object it will be used for all items in the collection.
    * In this case it doesn't return anything but fill the elements innerHTML with
    * the shrunken text.
    *
    * @param {Integer} maxLen               The max. length without the replacement string length.
    * @param {String / jQ-Object} msgObj    The text or jQ-element (later used with .html()) which will be shrinked.
    * @param {String} replace               Optional text which symbolize the cut, default is [...].
    *
    * @return {String}                      Shrunken string
    */
    shrink: function (msgObj, maxLen, replace) {
        'use strict';

        function shrinkData(absolute) {
            var s = absolute,
                cnt = s.length,
                sArr = s.split(''),
                msgPart1 = '',
                msgPart2 = '',
                avgPos = 0,
                replacer = replace || '[...]';

            if (cnt - 1 <= maxLen) {
                return absolute;
            }

            while (cnt - 1 > maxLen) {
                sArr[Math.ceil(cnt / 2) - 1] = '';
                sArr = sArr.join('').split('');
                cnt--;
            }

            s = sArr.join('');

            avgPos = Math.ceil(cnt / 2);

            msgPart1 = s.substr(0, avgPos - 1);
            msgPart2 = s.substr(avgPos, s.length - avgPos);

            return msgPart1 + replacer + msgPart2;
        }

        if (typeof msgObj === 'string') {
            return shrinkData(msgObj);
        }

        if (msgObj.length) {
            msgObj.each(function () {

                var absolute = $.trim($(this).html()),
                    absoluteTitle = $.trim(absolute);

                if (absolute !== 0) {
                    $(this).attr('title', absoluteTitle).html(shrinkData(absolute));
                }
                if (absolute.length > maxLen) {
                    $(this).attr('data-shrink', 'true');
                    $(this).addClass('shrinked');
                }
            });
        }

    },

    /**
    *
    * Shrink a given string and replace the end with '[...]'.
    *
    * @param {String }  txt         The text which will be shrunken.
    * @param {Integer}  maxLen      The max. length without the replacement string length.
    * @param {String}   replace     Optional text which symbolize the cut, default is [...].
    *
    * @return {String}              Shrunked string
    */
    moreTextShrink: function (txt, maxLen, replace) {
        'use strict';

        txt = $.trim(txt);
        replace = replace || '[...]';

        var shortTxt = txt;

        if ( txt.length > maxLen + replace.length ) {
            shortTxt = txt.substr(0, maxLen) + replace;
        }

        return '<span title=\"' + txt + '\">' + shortTxt + '</span>';
    },

    /**
    *
    * Select or deselect all given checkboxes.
    *
    * @param {jQ-Object} masterBox  The master checkbox which selects or deselects.
    * @param {jQ-Object} group      The Collection which will selected or deselected.
    * @param {Boolean}   dynamicGroup Use group from cache or get the string and get it on every call
    * @param {Object}    callbacks Object for onselect ondeselect callbacks.
    * @param {Boolean}   filterDisabled Object for onselect ondeselect callbacks.
    *
    */
    checkboxChecker: function ($masterBox, $group, dynamicGroup, callbacks, filterDisabled) {
        'use strict';

        $masterBox.on('click', function () {
            var isChecked = $(this).is(':checked'),
                filter = ':disabled';

            callbacks = callbacks || {
                onSelect: function () {},
                onDeselect: function () {}
            };

            dynamicGroup = typeof dynamicGroup === 'undefined' ? true : dynamicGroup; // default

            var $selected_group = dynamicGroup
                ? typeof $group === 'string'
                    ? $($group)
                    : $($group.selector)
                : $group;

            $selected_group
                .filter(function () { return $(this).is(':visible'); })
                .not(filterDisabled ? filter : '')
                [$.prop ? 'prop' : 'attr']('checked', isChecked ? true : false).trigger('change');

            callbacks[isChecked ? 'onSelect' : 'onDeselect']();
        });
    },

    /**
    *
    * Throttle functions with delay.
    *
    * @param {Function} fn      Function which will be fired after delay.
    * @param {Integer}  delay   Delay for firing in ms.
    *
    * @return {Function}        Timer
    */
    throttle: function (fn, delay) {
        'use strict';

        var timer = null;

        return function () {
            var context = this,
                args = arguments;

            window.clearTimeout(timer);

            timer = window.setTimeout(function () {
                fn.apply(context, args);
            }, delay);
        };
    },

    /**
    *
    * Show a hint on focus and hide it again when blur is triggered.
    *
    * @param {String}   prefix  Prefix.
    */
    inputHint: function (prefix) {
        'use strict';

        prefix = prefix || 'hint_';

        $('input[rel^=' + prefix + ']').each(function () {
            var $this = $(this),
                rel = $this.attr('rel'),
                hintSpan = $('span[rel=' + rel + ']');

            $this
                .on('focusin click', function () {
                    hintSpan.css('display', 'inline');
                })
                .on('focusout keypress', function () {
                    hintSpan.css('display', 'none');
                });
        });
    },

    /**
    *
    * Show an alert if the value length is greater then the defined max length.
    *
    * @param {jQ-Object}    $field  Field.
    * @param {Integer}      maxLength   Max length which would check against $field length.
    * @param {Object}       event
    * @param {String}       string to show in alert window
    */
    passwordLength: function ($field, maxLength, event, message) {
        'use strict';

        $F.globals.pwlengthcheck = 0;
        $F.globals.keytest = event ? (event || window.event).keyCode : 0;

        var keycheck = function () {
            var length = $field.val().length;

            //Ausschluß der Reaktion auf Entertaste und Löschen / (Tabtaste)
            if ($F.globals.keytest === 13 || $F.globals.keytest === 8) { // $F.globals.keytest === 9
                return false;
            }
            else {
                if (length > maxLength && $F.globals.pwlengthcheck === 0) {
                    $F.globals.pwlengthcheck = 1;
                    if ( ! message )
                        message = i18n.t('common:error_pwLength', { count: maxLength });
                    else
                        message = message.replace( '__count__', maxLength );

                    window.alert(
                        window.unescape( message )
                    );

                    return true;
                }
            }
        };

        setTimeout(function () {
            keycheck();
        }, 200);
    },

    /**
    *
    * Reformat any Character to a defined Character.
    *
    * @param {String} className to Reformat.
    */
    parsePoint: function (className) {
        'use strict';

        $(className).each(function () {
            var $this = $(this);
            $this.html($this.html().replace(/\./g, ','));
            return $this;
        });
    },

    /**
    *
    * Reformat Datestrings.
    *
    * @param {String} className.
    */
    displayDate: function (className) {
        'use strict';

        $(className).each(function () {
            var $this     = $(this),
                date_time = $this.text().replace(/^\s+|\s+$/g, '').split(' ');

            if ( date_time[0].indexOf( "-" ) > -1 ) {
                var newDate   = date_time[0].split('-'),
                    newTime   = date_time[1] ? ' ' + date_time[1] : '',
                    year      = newDate[0],
                    month     = newDate[1],
                    day       = newDate[2];

                $this.attr("data-date", year + '-' + month + '-' + day + newTime );

                $this.html( $F.ksb.utils.helper.getLocalDate( newDate ) + newTime );
            }
        });
    },

    /**
    *
    * Format a date from an array containing year, month, day in that order.
    *
    * @param {Array} dateArray.
    */
    getLocalDate: function ( dateArray ) {
        var lang = $F.ksb.globals.lang;
        if ( dateArray.length === 3 ) {
            switch ( lang ) {
                case 'ger':
                    return dateArray[ 2 ] + '.' + dateArray[ 1 ] + '.' + dateArray[ 0 ];
                case 'dut':
                    return dateArray[ 2 ] + '-' + dateArray[ 1 ] + '-' + dateArray[ 0 ];
                default:
                    return dateArray[ 2 ] + '/' + dateArray[ 1 ] + '/' + dateArray[ 0 ];
            }
        }
    },

    /**
    *
    * Get table indices
    *
    * @param {jQ-Object} $tableSelector.
    */
    getTableIndices: function ($tableSelector) {
        'use strict';

        var indices = [];

        $tableSelector.each(function () {
            var $this = $(this);

            if ($this.find('input[type=checkbox]:first').is(':checked')) {
                indices.push($this.index());
            }
        });

        return indices;
    },

    /**
    *
    * isNumber
    *
    * @param {Number} Expect number.
    */
    isNumber: function (n) {
        'use strict';
        return !isNaN(parseFloat(n)) && isFinite(n);
    },

    /**
     *
     * formatPrice
     *
     * @param {String} price         the price which will be reformated
     * @param {String} lang          the current language
     *
     * @return {String}              nice price
     */
    formatPrice: function ( price, lang ) {
        'use strict';
        var separator = ',';

        if ( lang == 'eng' ) {
            separator = '.';
        }

        if ( price.match( '\.' ) ) {
            if ( price.match( /\.\d$/ ) )
                price += '0';
            return price.replace( '\.', separator );
        }
        else {
            return price;
        }
    }
};
