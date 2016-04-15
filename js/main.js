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
    _array.push(new TreeNode({ "name": "New Task", "id": _id }));
    $(_array[_array.length - 1].gen_card()).insertBefore($("#add_card"));
    N.setOnclick(_id);
    N.saveAll();
}

/**
 * [sub_add_new_card description]
 * @param  {[type]} _node [description]
 * @return {[type]}       [description]
 */
sub_add_new_card = function(_node) {
    var _id = _node.N.nextId();
    _node.children.push(new TreeNode({ "name": "New Task", "id": _id }));
    $(_node.children[_node.children.length - 1].gen_card()).insertBefore($("#sub_add_card"));
    N.setOnclick(_id);
    N.saveAll();
}

/**
 * [import_card description]
 * @param  {[type]} _array [description]
 * @param  {[type]} _obj   [description]
 * @return {[type]}        [description]
 */
import_card = function(_array, _obj) {
    _array.push(new TreeNode(_obj));
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
        var _parentId = _id.split("-");
        _parentId.splice(-1, 1);
        _parentId = _parentId.join("-");
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
        $(nodes[i].gen_card()).insertBefore($("#add_card"));
        nodes[i].setOnclick();
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
        $(nodes[i].gen_card()).insertBefore($("#sub_add_card"));
    for (var i = 0; i < nodes.length; i++)
        nodes[i].setOnclick();

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
 * [refresh_card description]
 * @param  {[type]} _id [description]
 * @return {[type]}     [description]
 */
refresh_card = function(_id) {
    N.find(_id).refresh_card();
}

/**
 * [flip_check description]
 * @param  {[type]} _id [description]
 * @return {[type]}     [description]
 */
flip_check = function(_id) {
    N.find(_id).flip_check();
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
resetDay = function() {
    for (var i = 0; i < 3; i++) {
        for (var ii = 0; ii < mainNode[i].length; ii++)
            mainNode[i][ii].reset();
    }
    pushCategToBoard(STATUS.categ);
    N.saveAll();
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


chrome.storage.sync.get('mainNode', function(result) {
    N.loadAll(result.mainNode);
    pushCategToBoard(STATUS.categ);
});

chrome.storage.sync.get('taskData', function(result) {
    T.loadAll(result.taskData);
});

$("#categ_1").click(function() { switchCateg(0); });
$("#categ_2").click(function() { switchCateg(1); });
$("#categ_3").click(function() { switchCateg(2); });

$('#add_card').click(function() {
    add_new_card(nodeArray(STATUS.categ));
});

$('#sub_add_card').click(function() {
    sub_add_new_card(N.find(STATUS.subpageId));
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
