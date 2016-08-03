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
require("./settings.js");
require("./save.js");
require("./bgCanvas.js");

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

    N.saveAll();

    return 1;
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


//opens settings subpage
openSettings = function() {
    greypage(true);
    settingsPage(true);
    STATUS.settingsMode = true;
}

openCat = function() {
    greypage(true);
    catPage(true);
    STATUS.catMode = true;
}

expand_card = function(_id) {
    STATUS.subpageId = _id;
    greypage(true);
    subpage(true);
    STATUS.subMode = true;
    //$("#cup_sub_title").val(N.find(_id).name);
    N.push();
    N.saveAll();
    return -1;
}

//clears all subpage types and greypage, pushes categ according to STATUS, SAVES
returnToMain = function() {
    greypage(false);
    subpage(false);
    settingsPage(false);
    catPage(false);

    STATUS.subMode = false;
    STATUS.settingsMode = false;
    STATUS.catMode = false;

    N.push();
    N.saveAll();
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

catPage = function(_in) {
    if (_in) {
        $("#cat_sub_page").removeClass("hidden_top");
        $("#cat_sub_page").addClass("hidden_top_reveal");
    } else {
        $("#cat_sub_page").removeClass("hidden_top_reveal");
        $("#cat_sub_page").addClass("hidden_top");
    }
}

/**
 * [resetDay description]
 * @return {[type]} [description]
 */
checkoutNodes = function() {
    N.evalAll();
}

chrome.storage.local.get('versionStamp', function(result) {
    if (result.versionStamp >= 1) {
        loadProper();
    } else {
        N.render();
        S.render();
        N.saveAll();
    }
});

chrome.storage.local.set({ 'versionStamp': 1 });

loadProper = function() {
    chrome.storage.local.get('mainNode', function(result) {
        N.loadAll(result.mainNode);
        //N.render();
        //conso
        chrome.storage.local.get('STATUS', function(res) {
            STATUS = res.STATUS;
            STATUS.subMode = false;
            N.render();
            S.render();
        });
        //pushCategToBoard(STATUS.categ);
    });

    chrome.storage.local.get('taskData', function(result) {
        T.loadAll(result.taskData);
    });
}

$("#bar_bottom").tooltip(STYLE.tooltip);

setBaseOnclicks();
