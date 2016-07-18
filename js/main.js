/**
 *TRAIBLAZER - Tracks Work, Hobbies, Habits, and Tasks
 *2016 Jo Chuang
 */

//external packages
React = require('react');
ReactDOM = require('react-dom');
_ = require('lodash');
$ = require('jquery');
require("jquery-ui");

//internal packages for organization
require("./params.js");
require("./base.js");
require("./tree.js");
require("./task.js");
require("./notebook.js");
require("./save.js");
require("./bgCanvas.js");

//Adds new Trail to inputted array, using next avaiblable ID
add_new_card = function(_array) {
    var _id = N.nextId();
    _array.push(N.create({ "name": "New Task", "id": _id }));
    $(N.gen_card(_array[_array.length - 1])).insertBefore($("#add_card"));
    N.setOnclick(_id);
    N.saveAll();
}

//Adds new subTrail to inputted Trail, using next available sub ID
sub_add_new_card = function(_node) {
    var _id = N.nextChildId(_node.id);
    _node.children.push(N.create({ "name": "New Task", "id": _id }));
    $(N.gen_card(_node.children[_node.children.length - 1])).insertBefore($("#sub_add_card"));
    N.setOnclick(_id);
    N.saveAll();
}

//deletes card with ID/sub ID, then SAVES
delete_card = function(_id) {
    var done = false;

    //TODO: optimize search
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

//expands Trail/subTrail to subpage, SAVES
expand_card = function(_id) {
    STATUS.subpageId = _id;
    greypage(true);
    subpage(true);
    STATUS.subMode = true;
    $("#cup_sub_title").val(N.find(_id).name);
    pushNodeToSub(N.find(_id));
    N.saveAll();
    return -1;
}

//opens settings subpage
openSettings = function() {
    greypage(true);
    settingsPage(true);
    STATUS.settingsMode = true;
}

//pushes nodeArray(input) to main board, attaches tooltips
pushCategToBoard = function(_categ) {
    if (_categ != STATUS.categ) {
        $('#categ_' + (_categ + 1)).toggleClass("top_");
        $('#categ_' + (_categ + 1)).toggleClass("top_s");
        $('#categ_' + (STATUS.categ + 1)).toggleClass("top_");
        $('#categ_' + (STATUS.categ + 1)).toggleClass("top_s");
        STATUS.categ = _categ;
    }

    N.pushMain()
    attachTooltips();
}


//used by expand_card, pushes input's children to HTML, attaches tooltips
pushNodeToSub = function(_node) {
    $("#cup_sub").html(subPlusCardText);
    //while($("#cup_main").html != ""){}
    console.log(_node);
    var nodes = _node.children;
    for (var i = 0; i < nodes.length; i++)
        $(N.gen_card(nodes[i])).insertBefore($("#sub_add_card"));
    N.setOnclick(_node);

    $('#sub_add_card').click(function() {
        sub_add_new_card(N.find(STATUS.subpageId));
    });

    attachTooltips();
}

//clears all subpage types and greypage, pushes categ according to STATUS, SAVES
returnToMain = function() {
    greypage(false);
    subpage(false);
    settingsPage(false);

    pushCategToBoard(STATUS.categ);
    STATUS.subMode = false;
    STATUS.settingsMode = false;
    N.saveAll();
    return -1;
}

//attaches tooltips to all .box
attachTooltips = function() {
    $(".box>.box").tooltip(STYLE.tooltip);
}

//uses pushCategToBoard, then updates categBar and STATUS


//sets greypage display IO
greypage = function(_in) {
    if (_in) {
        $("#greypage").css("display", "block");
        //$("#greypage").removeClass("hidden_fade");
    } else {
        $("#greypage").css("display", "none");
        //$("#greypage").addClass("hidden_fade");
    }
}

//sets subpage display IO
subpage = function(_in) {
    if (_in) {
        $("#cup_sub_page").removeClass("hidden_top");
        $("#cup_sub_page").addClass("hidden_top_reveal");
    } else {
        $("#cup_sub_page").removeClass("hidden_top_reveal");
        $("#cup_sub_page").addClass("hidden_top");
        $("#cup_sub").html(subPlusCardText);
    }
}

//sets settings display IO
settingsPage = function(_in) {
    if (_in) {
        $("#settings_sub_page").removeClass("hidden_top");
        $("#settings_sub_page").addClass("hidden_top_reveal");
    } else {
        $("#settings_sub_page").removeClass("hidden_top_reveal");
        $("#settings_sub_page").addClass("hidden_top");
    }
}

subpage = function(_in) {
    if (_in) {
        $("#cup_sub_page").removeClass("hidden_top");
        $("#cup_sub_page").addClass("hidden_top_reveal");
    } else {
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

updateCategBar = function() {
    for (var i = 0; i < mainNode.length; i++) {
        $("#prog_" + (i + 1)).css("width", (1 - N.categPercentage(i)) * 100 + "%");
    }
}

chrome.storage.local.get('mainNode', function(result) {
    N.loadAll(result.mainNode);
    N.render();
    //pushCategToBoard(STATUS.categ);
    updateCategBar();
});

chrome.storage.local.get('taskData', function(result) {
    T.loadAll(result.taskData);
});

setBaseOnclicks();
updateCategBar();
