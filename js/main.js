/**
 *TRAIBLAZER - Tracks Work, Hobbies, Habits, and Tasks
 * Function categories:
 * SAVE
 * ATTACH
 * GET
 * TREE
 * MISC
 */

React = require('react');
ReactDOM = require('react-dom');

_ = require('lodash');
$ = require('jquery');

require("jquery-ui");
require("./params.js");
require("./base.js");
require("./tree.js");
require("./task.js");
require("./notebook.js");

/**
 * [add_new_card description]
 * @param {[type]} _array [description]
 */
add_new_card = function(_array) {
    var _id = N.nextId();
    _array.push(N.create({ "name": "New Task", "id": _id }));
    $(N.gen_card(_array[_array.length - 1])).insertBefore($("#add_card"));
    N.setOnclick(_id);
    N.saveAll();
}

/**
 * [sub_add_new_card description]
 * @param  {[type]} _node [description]
 * @return {[type]}       [description]
 */
sub_add_new_card = function(_node) {
    var _id = N.nextChildId(_node.id);
    _node.children.push(N.create({ "name": "New Task", "id": _id }));
    $(N.gen_card(_node.children[_node.children.length - 1])).insertBefore($("#sub_add_card"));
    N.setOnclick(_id);
    N.saveAll();
}

/**
 * [delete_card description]
 * @param  {[type]} _id [description]
 * @return {[type]}     [description]
 */
delete_card = function(_id) {
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
        var _parentId = N.parentId(_id);
        var _parent = N.find(_parentId);
        for (var i in _parent.children) {
            if (_parent.children[i].id == _id) {
                _parent.children.splice(i, 1);
                done = true;
            }
        }
    }

    $("#card_" + _id).remove();
    N.saveAll();

    return 1;
}

/**
 * [expand_card description]
 * @param  {[type]} _id [description]
 * @return {[type]}     [description]
 */
expand_card = function(_id) {
    greypage(true);
    subpage(true);
    $("#cup_sub_title").html(N.find(_id).name);
    STATUS.subpageId = _id;
    pushNodeToSub(N.find(_id));
    STATUS.subMode = true;
    N.saveAll();
    return -1;
}


/**
 * [pushCategToBoard description]
 * @param  {[type]} _categ [description]
 * @return {[type]}        [description]
 */
pushCategToBoard = function(_categ) {
    $("#cup_main").html(plusCardText);
    var nodes = nodeArray(_categ);
    for (var i = 0; i < nodes.length; i++) {
        $(N.gen_card(nodes[i])).insertBefore($("#add_card"));
        N.setOnclick(nodes[i].id);
    }

    $('#add_card').click(function() {
        add_new_card(nodeArray(STATUS.categ));
    });
    attachTooltips();
}

/**
 * [pushNodeToSub description]
 * @param  {[type]} _node [description]
 * @return {[type]}       [description]
 */
pushNodeToSub = function(_node) {
    $("#cup_sub").html(subPlusCardText);
    //while($("#cup_main").html != ""){}
    var nodes = _node.children;
    for (var i = 0; i < nodes.length; i++)
        $(N.gen_card(nodes[i])).insertBefore($("#sub_add_card"));
    for (var i = 0; i < nodes.length; i++)
        N.setOnclick(nodes[i].id);

    $('#sub_add_card').click(function() {
        sub_add_new_card(N.find(STATUS.subpageId));
    });

    attachTooltips();
}



/**
 * [returnToMain description]
 * @return {[type]} [description]
 */
returnToMain = function() {
    greypage(false);
    subpage(false);
    pushCategToBoard(STATUS.categ);
    STATUS.subMode = false;
    N.saveAll();
    return -1;
}

/**
 * ATTACH
 * Attaches jquery tooltips to boxes
 * Use whenever new boxes are added
 * @return {null}
 */
attachTooltips = function() {
    $(".box").tooltip(STYLE.tooltip);
}

/**
 * [switchCateg description]
 * @param  {[type]} _target [description]
 * @return {[type]}         [description]
 */
switchCateg = function(_target) {
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
greypage = function(_in) {
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
subpage = function(_in) {
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
checkoutNodes = function() {
    N.evalAll();
}

/**
 * [backButton description]
 * @return {[type]} [description]
 */
backButton = function() {
    var temp = STATUS.subpageId.toString().split("-");
    if (temp.length <= 1)
        returnToMain();
    else
        expand_card(temp.slice(0, -1).join("-"));
}

nodeArray = function(_categ) {
    /*
    if (typeof _id == 'number')
        return N.findInArray(_id, mainNode[_categ]);*/
    return mainNode[_categ];
}


chrome.storage.local.get('mainNode', function(result) {
    N.loadAll(result.mainNode);
    pushCategToBoard(STATUS.categ);
});

chrome.storage.local.get('taskData', function(result) {
    T.loadAll(result.taskData);
});

setBaseOnclicks();