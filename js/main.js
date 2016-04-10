//GLOBALS
var colors = {
    "LINE": "#FFFFFF",
    "LINE2": "#A3A3A3",
    "GREEN": "#00FF00",
    "ORANGE": "#FFA500",
};
var lineStyle = ["solid 1px " + colors.LINE, "solid 1px " + colors.LINE2];
var botPartitionStyles = [{
        'top': '50%',
        'height': '50%',
        'border-top': lineStyle[0]
    }, {
        'top': '60%',
        'height': '40%',
        'border-top': lineStyle[0],
    }, //style="top:60%; height:40%; border-top:solid 1px #E8E8E8;
    {
        'top': '70%',
        'height': '30%',
        'border-top': lineStyle[0]
    }
];

var topPartitionStyles = [{
        'height': '50%'
    }, {
        'height': '60%',
    }, //style="top:60%; height:40%; border-top:solid 1px #E8E8E8;
    {
        'height': '70%',
    }
];

var mainNode = [
    [],
    [],
    []
];

var currentCateg = 1;
var subpageId;
var subMode = false;

chrome.storage.sync.get('mainNode', function(result) {
    load_all(result.mainNode);
    pushCategToBoard(currentCateg);
});

chrome.storage.sync.get('notebook', function(result) {
    load_nb(result.notebook);
});

$("#nbarea").keyup(function() {
    /*if (this.value.match(/[^0-9a-zA-Z" "]/g)) {
         this.value = this.value.replace(/[^0-9a-zA-Z" "]/g, '');
     } code for eliminating input by regex*/
    save_nb();//(_id, this.value);
});

function attachTooltips() {
    $(".box").tooltip({
        position: {
            my: 'center bottom-20',
            at: 'center top'
        },
        track: true,
        show: {
            effect: "toggle"
        },
        hide: {
            effect: "toggle"
        }
    });
}

function CardHandler() {
    var name, parent, children, checked;
}

function divHeadGen(params, styleParams) {
    var text = "<div";
    var paramList = ["id", "class", "title"];
    var styleParamList = ["top", "bottom", "left", "right", "height", "width", "background-color", "border-top", "border-bottom", "border-left", "border-right"];

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

function boolToCol(ticked) {
    if (ticked) {
        return colors.GREEN;
    }
    return colors.ORANGE;
}

function bToCClass(ticked) {
    if (ticked) {
        return 'but_green';
    }
    return 'but_orange';
}

function nodeQuery(_categ, _id) {
    if (typeof _id == 'number')
        return findNodeInArray(_id, mainNode[_categ]);
    return mainNode[_categ];
}
//mostly used for returning the categ arrays, second param can look for specific node by id

// function findNodeInArray(_id, _array) {
//     for (var i in _array) {
//         if (i.id == _id.toString())
//             return i;
//     }
//     return -1;
// }

function findNode(_id, _reference) {
    if (_.isArray(_reference)) {
        //ARRAY
        for (var t in _reference) {
            var obj = findNode(_id, _reference[t]);
            if (obj != -1)
                return obj;
        }
    } else if (typeof _reference == "object") {
        if (_reference.id == _id)
            return _reference;
        for (var t in _reference.children) {

            var obj = findNode(_id, _reference.children[t]);
            if (obj != -1)
                return obj;
        }
        return -1;
        //NODE
    } else {
        //mainNode
        for (var t in mainNode) {
            var _array = mainNode[t];
            var obj = findNode(_id, _array);
            if (obj != -1)
                return obj;
        }
    }
    return -1;
}

var plusCardText = '<div id = "add_card" class = "inline card"><img src = "..\\plus.png"></div>';

var subPlusCardText = '<div id = "sub_add_card" class = "inline card"><img src = "..\\plus.png"></div>';

function pushCategToBoard(_categ) {
    $("#cup_main").html(plusCardText);
    var nodes = nodeQuery(_categ);
    for (var i = 0; i < nodes.length; i++)
        $(nodes[i].gen_card()).insertBefore($("#add_card"));
    for (var i = 0; i < nodes.length; i++)
        nodes[i].set_onclicks();

    $('#add_card').click(function() {
        add_new_card(nodeQuery(currentCateg));
    });

    attachTooltips();

}

function pushNodeToSub(_node) {
    $("#cup_sub").html(subPlusCardText);
    //while($("#cup_main").html != ""){}
    var nodes = _node.children;
    for (var i = 0; i < nodes.length; i++)
        $(nodes[i].gen_card()).insertBefore($("#sub_add_card"));
    for (var i = 0; i < nodes.length; i++)
        nodes[i].set_onclicks();

    $('#sub_add_card').click(function() {
        sub_add_new_card(findNode(subpageId));
    });

    attachTooltips();

}

function save_all() {
    var _mainNode = [];
    for (var i in mainNode) {
        _mainNode[i] = [];
        for (var ii in mainNode[i])
            _mainNode[i][ii] = mainNode[i][ii].dataOnly();
    }
    chrome.storage.sync.set({ 'mainNode': _mainNode }, function() {});
}

function load_all(_obj) {
    for (var i = 0; i < _obj.length; i++) {
        for (var ii in _obj[i]) {
            import_card(nodeQuery(i), _obj[i][ii]);
        }
    }
}

function save_nb() {
    chrome.storage.sync.set({ 'notebook': $('#nbarea').val() }, function() {});
}

function load_nb(result) {
    $('#nbarea').val(result);
}

function add_new_card(_array) {
    var _id = nextAvailableId();
    _array.push(new TreeNode({ "name": "New Task", "id": _id }));
    $(_array[_array.length - 1].gen_card()).insertBefore($("#add_card"));
    set_onclicks(_id);
    save_all();
}

function sub_add_new_card(_node) {
    var _id = _node.nextAvailableId();
    _node.children.push(new TreeNode({ "name": "New Task", "id": _id }));
    $(_node.children[_node.children.length - 1].gen_card()).insertBefore($("#sub_add_card"));
    set_onclicks(_id);
    save_all();
}

function import_card(_array, _obj) {
    _array.push(new TreeNode(_obj));
}

function refresh_card(_id) {
    findNode(_id).refresh_card();
}

function flip_check(_id) {
    findNode(_id).flip_check();
}

function set_onclicks(_id) {
    findNode(_id).set_onclicks();
    attachTooltips();
}

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

function expand_card(_id) {
    greypage(true);
    subpage(true);
    $("#cup_sub_title").html(findNode(_id).name);
    subpageId = _id;
    pushNodeToSub(findNode(_id));
    subMode = true;
    save_all();
    return -1;
}

function returnToMain() {
    greypage(false);
    subpage(false);
    pushCategToBoard(currentCateg);
    subMode = false;
    save_all();
    return -1;
}

function update_name(_id, _name) {
    findNode(_id).set_name(_name);
}

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

function switchCateg(_target) {
    pushCategToBoard(_target);
    $('#categ_' + (_target + 1)).toggleClass("top_");
    $('#categ_' + (_target + 1)).toggleClass("top_s");
    $('#categ_' + (currentCateg + 1)).toggleClass("top_");
    $('#categ_' + (currentCateg + 1)).toggleClass("top_s");
    currentCateg = _target;
}

function greypage(_in) {
    if (_in) {
        $("#greypage").css("display", "block");
        //$("#greypage").removeClass("hidden_fade");
    } else {
        $("#greypage").css("display", "none");
        //$("#greypage").addClass("hidden_fade");
    }
}

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

function resetDay() {
    for (var i = 0; i < 3; i++) {
        for (var ii = 0; ii < mainNode[i].length; ii++)
            mainNode[i][ii].reset();
    }
    pushCategToBoard(currentCateg);
    save_all();
}

function backButton(){
    var temp = subpageId.toString().split("-");
    console.log(temp);
    if (temp.length <= 1)
        returnToMain();
    else
        expand_card(temp.slice(0,-1).join("-"));
}

$("#categ_1").click(function() { switchCateg(0); });
$("#categ_2").click(function() { switchCateg(1); });
$("#categ_3").click(function() { switchCateg(2); });

$('#add_card').click(function() {
    add_new_card(nodeQuery(currentCateg));
});

$('#sub_add_card').click(function() {
    sub_add_new_card(findNode(subpageId));
});

$('#greypage').click(function() {
    returnToMain();
});

$('#reset_btn').click(function() {
    resetDay();
})

$('#arrowOut').click(function(){
    backButton();
})