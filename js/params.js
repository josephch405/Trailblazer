/**
 * PARAM.js
 * for (more or less) static objects
 */

/**
 * Styling object for colors, lines, partition styles
 * @type {Object}
 */

STYLE = {
    "colors": {
        "LINE": "#FFFFFF",
        "LINE2": "#A3A3A3",
        "GREEN": "#00FF00",
        "ORANGE": "#FFA500",
    },

    "topPartition": [{
        'height': '50%'
    }, {
        'height': '60%',
    }, {
        'height': '70%',
    }],

    "tooltip": {
        position: {
            my: 'center bottom',
            at: 'center top'
        },
        track: false,
        show: {
            effect: "toggle"
        },
        hide: {
            effect: "toggle"
        }
    }
};

STYLE["line"] = [
    "solid 1px " + STYLE.colors.LINE,
    "solid 1px " + STYLE.colors.LINE2
];

STYLE["botPartition"] = [{
    'top': '50%',
    'height': '50%',
    'border-top': STYLE.line[0]
}, {
    'top': '60%',
    'height': '40%',
    'border-top': STYLE.line[0],
}, {
    'top': '70%',
    'height': '30%',
    'border-top': STYLE.line[0]
}];

/**
 * Texts for plus-card texts
 * @type {String}
 */
plusCardText = '<div id = "add_card" class = "inline card"><img src = "../img/plus.png"></div>';
subPlusCardText = '<div id = "sub_add_card" class = "inline card"><img src = "../img/plus.png"></div>';


/**
 * Status object for tracking user states
 * @type {Object}
 */
STATUS = {
    "categ": 1,
    "subpageId": -1,
    "subMode": false,
    "settingsMode": false
};
