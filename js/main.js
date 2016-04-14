/**
 *TRAIBLAZER - Tracks Work, Hobbies, Habits, and Tasks
 * Function categories:
 * SAVE
 * ATTACH
 * GET
 * TREE
 * MISC
 */
_ = require('lodash');
$ = require('jquery');
require("jquery-ui");
require("./params.js");
require("./base.js");
require("./tree.js");
require("./notebook.js");

/**
 * [add_new_card description]
 * @param {[type]} _array [description]
 */
add_new_card = function(_array) {
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
sub_add_new_card = function(_node) {
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
import_card = function(_array, _obj) {
    _array.push(new TreeNode(_obj));
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


chrome.storage.sync.get('mainNode', function(result) {
    load_all(result.mainNode);
    pushCategToBoard(STATUS.categ);
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
