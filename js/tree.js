N = {
    /**
     * Creates new tree-formatted object based on parameters
     * @param  Object input Filtered for existence
     * @return Object       Output object
     */
    create: function(input) {
        var _node = {
            "name": '',
            "checked": false,
            "id": -1,
            "rootId": -1,
            "children": [],
            "layer": -1,
            "value": 0
        }

        _node.name = _.has(input, 'name') ? input.name : '';
        _node.checked = _.has(input, 'checked') ? input.checked : false;
        _node.id = _.has(input, 'id') ? input.id : -1;
        _node.rootId = _.has(input, 'id') ? input.id.toString().split("-")[0] : -1;
        _node.layer = _.has(input, 'id') ? input.id.toString().split("-").length : -1;
        _node.value = _.has(input, 'value') ? input.value : 0;
        if (_.has(input, 'children')) {
            for (var i = 0; i < input.children.length; i++) {
                _node.children[i] = N.create(input.children[i]);
            }
        }
        return _node;
    },
    /**
     * Find a node based on ID - if already an object, returns object
     * RECURSIVE - Initializes at mainNode, propogates search throughout children
     * @param  {int || String}      _id          Top-layer nodes may have int ids
     * @param  {Array || Object}    _reference   ()Search is performed in this range
     * @return {int || Object}                  returns object found || -1 if not found
     */
    find: function(_id, _reference) {
        if (_.isArray(_id)) {
            _id = _id[0];
        } else if (typeof _id == "object") {
            return _id;
        }
        if (_.isArray(_reference)) {
            //propogate search through array
            for (var i in _reference) {
                var obj1 = N.find(_id, _reference[i]);
                if (obj1 != -1)
                    return obj1;
            }
        } else if (typeof _reference == "object") {
            //either return object, or propogate search downwards
            if (_reference.id == _id)
                return _reference;
            for (var j in _reference.children) {
                var obj2 = N.find(_id, _reference.children[j]);
                if (obj2 != -1)
                    return obj2;
            }
            return -1;
        } else {
            //initial call, start in mainNode
            for (var k in mainNode) {
                var _array = mainNode[k];
                var obj3 = N.find(_id, _array);
                if (obj3 != -1)
                    return obj3;
            }
        }
        return -1;
    },
    /**
     * Saves mainNode directly to storage
     * @return NULL
     */
    saveAll: function() {
        chrome.storage.local.set({
            'mainNode': mainNode
        }, function() {});
        updateCategBar();
    },
    /**
     * Loads array of objects into a certain category
     * @param  Array _obj   Array of objects to load
     * @param  int _categ   Category number to load to
     * @return NULL
     */
    loadCateg: function(_obj, _categ) {
        for (var i in _obj)
            nodeArray(_categ).push(N.create(_obj[i]));
    },

    categPercentage: function(index) {
        var counter = 0;
        for (var i in mainNode[index])
            counter += mainNode[index][i].checked ? 1 : 0;
        if (mainNode[index].length == 0)
            return 1;
        return counter/mainNode[index].length;
    },
    /**
     * Uses loadCateg to load all three categories
     * @param  Array _obj   Array of all three categories to load
     * @return NULL
     */
    loadAll: function(_obj) {
        mainNode = [
            [],
            [],
            []
        ]; //_obj ? _obj : [[],[],[]];
        for (var i = 0; i < 3; i++) {
            N.loadCateg(_obj[i], i);
        }
    },
    /**
     * Updates name of object fed, 
     * @param  {[type]} _id   [description]
     * @param  {[type]} _name [description]
     * @return {[type]}       [description]
     */
    updateName: function(_node, _name) {
        N.find(_node).name = _name;
    },
    gen_boxes: function(_node, layer) {
        if (!layer) layer = 0;

        var txt = '';
        _node = N.find(_node);

        if (_node.children.length > 0) {
            txt += divHeadGen({ "class": ("fade box " + bToCClass(_node.checked)), "id": "box_" + _node.id, "title": _node.name }, STYLE.topPartition[layer]);
            txt += '</div>';
            txt += divHeadGen({}, STYLE.botPartition[layer]);

            var topWidth = 100 / (_node.children.length);
            for (var i in _node.children) {
                txt += '<div ';
                txt += ' style="left: ' + topWidth * i + '%; ';
                txt += 'width:' + topWidth + '%; ';

                if (i > 0) {
                    txt += 'border-left:' + STYLE.line[0] + ";";
                }

                txt += '">';
                txt += N.gen_boxes(_node.children[i], layer + 1);
                txt += '</div>';
            }
            txt += '</div>';
        } else {
            txt += divHeadGen({ "class": "box fade " + bToCClass(_node.checked), "id": "box_" + _node.id, "title": _node.name }, {});
            txt += '</div>';
        }
        return txt;
    },
    gen_card_inner: function(_node) {
        _node = N.find(_node);
        var text = divClass('card_t');
        text += '<input maxlength="20" value = "' + _node.name + '">';
        text += divClass('card_ctrl');

        if (_node.layer < 3) {
            text += '<div class = "fade but_del" style="height:20%; border-bottom:' + STYLE.line[1] + '"></div>';
            text += divClass('but_ed');
            text += '</div>';
        } else {
            text += '<div class = "fade but_del" style="height:100%""></div>';
        }
        text += '</div>';
        text += '</div>';

        text += '<div class = "card_b">';
        text += N.gen_boxes(_node);
        text += '</div>';

        return text;
    },
    addToChildren: function(_node, input) {
        _node = N.find(_node);
        _node.children.push(input);
    },
    gen_card: function(_node) {
        _node = N.find(_node);
        var text = '<div id = "card_' + _node.id + '" class="inline card ' + N.valueToColorClass(_node.value) + '">';
        text += N.gen_card_inner(_node);
        text += '</div>';
        return text;
    },
    /**
     * [N.setOnclick description]
     * @param {[type]} _id [description]
     */
    setOnclick: function(_node, propog) {
        //propogdown
        _node = N.find(_node);
        if (propog) {
            var _id = _node.id;

            $("#box_" + _id).prop('onclick', null).off('click');
            $("#card_" + _id).find(".but_del").prop('onclick', null).off('click');
            $("#card_" + _id).find("input").prop('keyup', null).off('keyup');
            $("#card_" + _id).find(".but_ed").prop('keyup', null).off('click');

            $("#box_" + _id).click(function() {
                N.flip_check(_id);
                N.refresh_card(_id);
                N.setOnclick(_id);
                N.saveAll();
            });

            $("#card_" + _id).find(".but_del").click(function() {
                delete_card(_id);
            });


            $("#card_" + _id).find("input").keyup(function() {
                /*if (this.value.match(/[^0-9a-zA-Z" "]/g)) {
                     this.value = this.value.replace(/[^0-9a-zA-Z" "]/g, '');
                 } code for eliminating input by regex*/
                N.updateName(_id, this.value);
                N.saveAll();
            });

            $("#card_" + _id).find(".but_ed").click(function() {
                expand_card(_id);
            });
            for (var i in _node.children) {
                N.setOnclick(_node.children[i].id, true);
            }
        } else {
            if (STATUS.subMode) {
                $("#cup_sub_title").keyup(function() {
                    N.updateName(STATUS.subpageId, this.value);
                    N.saveAll();
                });
                console.log(STATUS.subpageId);
                console.log(N.find(STATUS.subpageId));
                $("#sub_checkDiv").removeClass(bToCClass(!N.find(STATUS.subpageId).checked));
                $("#sub_checkDiv").addClass(bToCClass(N.find(STATUS.subpageId).checked));
                $("#sub_checkDiv").prop('onclick', null).off('click');
                $("#sub_checkDiv").click(function() {
                    N.flip_check(STATUS.subpageId);
                    N.refresh_card(STATUS.subpageId);
                    N.setOnclick(STATUS.subpageId);
                    N.saveAll();
                });
            }
            N.setOnclick(_node.rootId, true);
        }
        attachTooltips();
    },
    refresh_card: function(_node) {
        _node = N.find(_node);
        var text = N.gen_card_inner(_node);
        var target = "#card_" + _node.id;
        $(target).html(text);
        if (N.parentId(_node.id) != -1)
            N.refresh_card(N.parentId(_node.id));
    },
    flip_check: function(_node) {
        _node = N.find(_node);
        _node.checked = !_node.checked;
    },
    nextChildId: function(_node) {
        _node = N.find(_node);
        var idList = [];
        for (var i = 0; i < _node.children.length; i++) {
            var _array = _node.children[i].id.split("-");

            idList.push(parseInt(_array[_array.length - 1]));
        }
        if (idList.length === 0) {
            return _node.id + "-" + 1;
        } else {
            var _i = 1;
            while (idList.indexOf(_i) != -1) {
                _i++;
            }
            return _node.id + "-" + _i;
        }
    },
    nextId: function() {
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
    },
    parentId: function(_node) {
        _node = N.find(_node);
        var _id = _node.id;
        if (typeof _id == "string") {
            _id = _id.split("-");
            _id.splice(-1, 1);
            if (_id.length > 1)
                return _id.join("-");
            if (_id.length > 0)
                return _id;
        }
        return -1;
    },
    clearValueAll: function() {
        for (var i in mainNode)
            for (var ii in mainNode[i])
                N.clearValue(mainNode[i][ii]);
        pushCategToBoard(STATUS.categ);
        N.saveAll();
    },
    clearValue: function(_node) {
        _node = N.find(_node);
        _node.value = 0;
        for (var i in _node.children)
            N.clearValue(_node.children[i]);
    },
    clearCheckedAll: function() {
        for (var i in mainNode)
            for (var ii in mainNode[i])
                N.clearChecked(mainNode[i][ii]);
        pushCategToBoard(STATUS.categ);
        N.saveAll();
    },
    clearChecked: function(_node) {
        _node = N.find(_node);
        _node.checked = false;
        for (var i in _node.children)
            N.clearChecked(_node.children[i]);
    },
    evalAll: function() {
        for (var i in mainNode)
            for (var ii in mainNode[i])
                N.evalCard(mainNode[i][ii]);
        N.clearCheckedAll();
        N.saveAll();
        returnToMain();
    },
    evalCard: function(_node) {
        _node = N.find(_node);
        _node.value *= .8;
        _node.value += _node.checked ? 2 : -2;
        for (var i in _node.children)
            N.evalCard(_node.children[i]);
    },
    valueToColorClass: function(_v) {
        if (_v > 7)
            return "gg";
        else if (_v > 3)
            return "gn";
        else if (_v > -3)
            return "nn";
        else if (_v > -7)
            return "rn";
        return "rr";
    },
    JSONexport: function(_node) {
        _node = N.find(_node);
        var returnText = JSON.stringify(_node);
        return returnText;
    },
    JSONimport: function(_node, string) {
        _node = N.find(_node);
        tempObject = JSON.parse(string);
        _node = N.create(tempObject);
    }
}
