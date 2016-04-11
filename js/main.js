/**
 *TRAIBLAZER - Tracks Work, Hobbies, Habits, and Tasks
 * Function categories:
 * SAVE
 * ATTACH
 * GET
 * TREE
 * MISC
 */

var mainNode = [
    [],
    [],
    []
];

/**
 * ATTACH
 * Attaches jquery tooltips to boxes
 * Use whenever new boxes are added
 * @return {null}
 */
function attachTooltips() {
    $(".box").tooltip(STYLE.tooltip);
}

/**
 * MISC
 * Generates and returns a <div> head based on params
 * Params selected according to internal array
 * @param  {object} params      class, id, title
 * @param  {object} styleParams style properties
 * @return {String}             returns the div head
 */
function divHeadGen(params, styleParams) {
    var text = "<div";
    var paramList = ["id", "class", "title"];
    var styleParamList = ["top", "bottom", "left", "right", "height",
        "width", "background-color", "border-top", "border-bottom", "border-left", "border-right"
    ];

    if (params) {
        for (var i in paramList) {
            if (params[paramList[i]]) {
                text += " " + paramList[i] + " = '" + params[paramList[i]] + "'";
            }
        }
    }

    if (styleParams) {
        text += " style = '";
        for (var i in styleParamList) {
            if (styleParams[styleParamList[i]]) {
                text += styleParamList[i] + ": " + styleParams[styleParamList[i]] + ";";
            }
        }
        text += "'";
    }
    text += ">";
    return text;
}

/**
 * MISC
 * Converts boolean to its appropriate color
 * @param  {bool} ticked    True is green, false is orange
 * @return {String}         Color
 */
function boolToCol(ticked) {
    if (ticked) {
        return STYLE.colors.GREEN;
    }
    return STYLE.colors.ORANGE;
}

/**
 * MISC
 * Converts boolean to its appropriate button class
 * @param  {bool} ticked    True is green, false is orange
 * @return {String}         Button class
 */
function bToCClass(ticked) {
    if (ticked) {
        return 'but_green';
    }
    return 'but_orange';
}


/**
 * GET
 * Find a node based on ID
 * RECURSIVE - Initializes at mainNode, propogates search throughout children
 * @param  {int || String}      _id          Top-layer nodes may have int ids
 * @param  {Array || Object}    _reference   Search is performed in this range
 * @return {int || }            [description]
 */
function findNode(_id, _reference) {
    if (_.isArray(_reference)) {
        //propogate search through array
        for (var i in _reference) {
            var obj1 = findNode(_id, _reference[i]);
            if (obj1 != -1)
                return obj1;
        }
    } else if (typeof _reference == "object") {
        //either return object, or propogate search downwards
        if (_reference.id == _id)
            return _reference;
        for (var j in _reference.children) {
            var obj2 = findNode(_id, _reference.children[j]);
            if (obj2 != -1)
                return obj2;
        }
        return -1;
    } else {
        //initial call, start in mainNode
        for (var k in mainNode) {
            var _array = mainNode[k];
            var obj3 = findNode(_id, _array);
            if (obj3 != -1)
                return obj3;
        }
    }
    return -1;
}

/**
 * [pushCategToBoard description]
 * @param  {[type]} _categ [description]
 * @return {[type]}        [description]
 */
function pushCategToBoard(_categ) {
    $("#cup_main").html(plusCardText);
    var nodes = nodeQuery(_categ);
    for (var i = 0; i < nodes.length; i++) {
        $(nodes[i].gen_card()).insertBefore($("#add_card"));
        nodes[i].set_onclicks();
    }

    $('#add_card').click(function() {
        add_new_card(nodeQuery(STATUS.categ));
    });
    attachTooltips();
}

/**
 * [pushNodeToSub description]
 * @param  {[type]} _node [description]
 * @return {[type]}       [description]
 */
function pushNodeToSub(_node) {
    $("#cup_sub").html(subPlusCardText);
    //while($("#cup_main").html != ""){}
    var nodes = _node.children;
    for (var i = 0; i < nodes.length; i++)
        $(nodes[i].gen_card()).insertBefore($("#sub_add_card"));
    for (var i = 0; i < nodes.length; i++)
        nodes[i].set_onclicks();

    $('#sub_add_card').click(function() {
        sub_add_new_card(findNode(STATUS.subpageId));
    });

    attachTooltips();

}

/**
 * [save_all description]
 * @return {[type]} [description]
 */
function save_all() {
    var _mainNode = [];
    for (var i in mainNode) {
        _mainNode[i] = [];
        for (var ii in mainNode[i])
            _mainNode[i][ii] = mainNode[i][ii].dataOnly();
    }
    chrome.storage.sync.set({ 'mainNode': _mainNode }, function() {});
}

/**
 * [load_all description]
 * @param  {[type]} _obj [description]
 * @return {[type]}      [description]
 */
function load_all(_obj) {
    for (var i = 0; i < _obj.length; i++) {
        for (var ii in _obj[i]) {
            import_card(nodeQuery(i), _obj[i][ii]);
        }
    }
}

/**
 * [save_nb description]
 * @return {[type]} [description]
 */
function save_nb() {
    chrome.storage.sync.set({ 'notebook': $('#nbarea').val() }, function() {});
}

/**
 * [load_nb description]
 * @param  {[type]} result [description]
 * @return {[type]}        [description]
 */
function load_nb(result) {
    $('#nbarea').val(result);
}

/**
 * [add_new_card description]
 * @param {[type]} _array [description]
 */
function add_new_card(_array) {
    var _id = nextAvailableId();
    _array.push(new TreeNode({ "name": "New Task", "id": _id }));
    $(_array[_array.length - 1].gen_card()).insertBefore($("#add_card"));
    set_onclicks(_id);
    save_all();
}

/**
 * [sub_add_new_card description]
 * @param  {[type]} _node [description]
 * @return {[type]}       [description]
 */
function sub_add_new_card(_node) {
    var _id = _node.nextAvailableId();
    _node.children.push(new TreeNode({ "name": "New Task", "id": _id }));
    $(_node.children[_node.children.length - 1].gen_card()).insertBefore($("#sub_add_card"));
    set_onclicks(_id);
    save_all();
}

/**
 * [import_card description]
 * @param  {[type]} _array [description]
 * @param  {[type]} _obj   [description]
 * @return {[type]}        [description]
 */
function import_card(_array, _obj) {
    _array.push(new TreeNode(_obj));
}

/**
 * [refresh_card description]
 * @param  {[type]} _id [description]
 * @return {[type]}     [description]
 */
function refresh_card(_id) {
    findNode(_id).refresh_card();
}

/**
 * [flip_check description]
 * @param  {[type]} _id [description]
 * @return {[type]}     [description]
 */
function flip_check(_id) {
    findNode(_id).flip_check();
}

/**
 * [set_onclicks description]
 * @param {[type]} _id [description]
 */
function set_onclicks(_id) {
    findNode(_id).set_onclicks();
    attachTooltips();
}

/**
 * [delete_card description]
 * @param  {[type]} _id [description]
 * @return {[type]}     [description]
 */
function delete_card(_id) {
    var done = false;

    for (var t in mainNode) {
        var _array = mainNode[t];
        for (var i in _array) {
            if (_array[i].id == _id.toString()) {
                _array.splice(i, 1);
                done = true;
            }
        }
    }

    if (!done && _id.split("-").length > 1) {
        var _parentId = _id.split("-");
        _parentId.splice(-1, 1);
        _parentId = _parentId.join("-");
        var _parent = findNode(_parentId);
        for (var i in _parent.children) {
            if (_parent.children[i].id == _id) {
                _parent.children.splice(i, 1);
                done = true;
            }
        }
    }

    $("#card_" + _id).remove();
    save_all();

    return 1;
}

/**
 * [expand_card description]
 * @param  {[type]} _id [description]
 * @return {[type]}     [description]
 */
function expand_card(_id) {
    greypage(true);
    subpage(true);
    $("#cup_sub_title").html(findNode(_id).name);
    STATUS.subpageId = _id;
    pushNodeToSub(findNode(_id));
    STATUS.subMode = true;
    save_all();
    return -1;
}

/**
 * [returnToMain description]
 * @return {[type]} [description]
 */
function returnToMain() {
    greypage(false);
    subpage(false);
    pushCategToBoard(STATUS.categ);
    STATUS.subMode = false;
    save_all();
    return -1;
}

/**
 * [update_name description]
 * @param  {[type]} _id   [description]
 * @param  {[type]} _name [description]
 * @return {[type]}       [description]
 */
function update_name(_id, _name) {
    findNode(_id).set_name(_name);
}

/**
 * [nextAvailableId description]
 * @return {[type]} [description]
 */
function nextAvailableId() {
    var idList = [];
    for (var i = 0; i < mainNode.length; i++) {
        for (var ii = 0; ii < mainNode[i].length; ii++) {
            idList.push(mainNode[i][ii].id);
        }
    }
    if (idList.length === 0) {
        return 1;
    } else {
        var _i = 1;
        while (idList.indexOf(_i) != -1) {
            _i++;
        }
        return _i;
    }
}

/**
 * [switchCateg description]
 * @param  {[type]} _target [description]
 * @return {[type]}         [description]
 */
function switchCateg(_target) {
    pushCategToBoard(_target);
    $('#categ_' + (_target + 1)).toggleClass("top_");
    $('#categ_' + (_target + 1)).toggleClass("top_s");
    $('#categ_' + (STATUS.categ + 1)).toggleClass("top_");
    $('#categ_' + (STATUS.categ + 1)).toggleClass("top_s");
    STATUS.categ = _target;
}

/**
 * [greypage description]
 * @param  {[type]} _in [description]
 * @return {[type]}     [description]
 */
function greypage(_in) {
    if (_in) {
        $("#greypage").css("display", "block");
        //$("#greypage").removeClass("hidden_fade");
    } else {
        $("#greypage").css("display", "none");
        //$("#greypage").addClass("hidden_fade");
    }
}

/**
 * [subpage description]
 * @param  {[type]} _in [description]
 * @return {[type]}     [description]
 */
function subpage(_in) {
    if (_in) {
        //$("#cup_sub_page").css("display", "block");
        $("#cup_sub_page").removeClass("hidden_top");
        $("#cup_sub_page").addClass("hidden_top_reveal");
    } else {
        //$("#cup_sub_page").css("display", "none");
        $("#cup_sub_page").removeClass("hidden_top_reveal");
        $("#cup_sub_page").addClass("hidden_top");
        $("#cup_sub").html(subPlusCardText);
    }
}

/**
 * [resetDay description]
 * @return {[type]} [description]
 */
function resetDay() {
    for (var i = 0; i < 3; i++) {
        for (var ii = 0; ii < mainNode[i].length; ii++)
            mainNode[i][ii].reset();
    }
    pushCategToBoard(STATUS.categ);
    save_all();
}

/**
 * [backButton description]
 * @return {[type]} [description]
 */
function backButton() {
    var temp = STATUS.subpageId.toString().split("-");
    console.log(temp);
    if (temp.length <= 1)
        returnToMain();
    else
        expand_card(temp.slice(0, -1).join("-"));
}

//IMPORTANT - replace with GET CATEG ARRAY function
function nodeQuery(_categ, _id) {
    if (typeof _id == 'number')
        return findNodeInArray(_id, mainNode[_categ]);
    return mainNode[_categ];
}
//DEFUNCT METHODS
//
// 
//mostly used for returning the categ arrays, second param can look for specific node by id

// function findNodeInArray(_id, _array) {
//     for (var i in _array) {
//         if (i.id == _id.toString())
//             return i;
//     }
//     return -1;
// }




chrome.storage.sync.get('mainNode', function(result) {
    load_all(result.mainNode);
    pushCategToBoard(STATUS.categ);
});

chrome.storage.sync.get('notebook', function(result) {
    load_nb(result.notebook);
});

$("#nbarea").keyup(function() {
    save_nb();
});

$("#categ_1").click(function() { switchCateg(0); });
$("#categ_2").click(function() { switchCateg(1); });
$("#categ_3").click(function() { switchCateg(2); });

$('#add_card').click(function() {
    add_new_card(nodeQuery(STATUS.categ));
});

$('#sub_add_card').click(function() {
    sub_add_new_card(findNode(STATUS.subpageId));
});

$('#greypage').click(function() {
    returnToMain();
});

$('#reset_btn').click(function() {
    resetDay();
})

$('#arrowOut').click(function() {
    backButton();
})
