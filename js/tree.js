mainNode = [
    [],
    [],
    []
];

N = {
    /**
     * Creates new tree-formatted object based on parameters
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
        return counter / mainNode[index].length;
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
    addToChildren: function(_node, input) {
        _node = N.find(_node);
        _node.children.push(input);
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
    delete_card: function(_id) {
        var done = false;

        //TODO: optimize search
        //First try finding on first layer
        for (var t in mainNode) {
            var _array = mainNode[t];
            for (var i in _array) {
                if (_array[i].id == _id.toString()) {
                    _array.splice(i, 1);
                    done = true;
                }
            }
        }

        //then try finding parent and then removing correct child
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
    render: function() {
        ReactDOM.render(
            <TreeMain data={mainNode[STATUS.categ]} />,
            document.getElementById('cup_main_page')
        );
        ReactDOM.render(
            <TreeSub data = {[]} />,
            document.getElementById('cup_sub_page')
        );
        attachTooltips();
    },
    pushMainHandler: null,
    pushMain: function() {
        this.pushMainHandler(mainNode[STATUS.categ]);
    },
    pushSubHandler: null,
    pushSub: function() {
        this.pushSubHandler(N.find(STATUS.subpageId));
    },
    push: function() {
        if (STATUS.subMode)
            this.pushSub();
        this.pushMain();
    }
}

TreeMain = React.createClass({
    getInitialState: function() {
        return { "data": this.props.data };
    },
    componentWillMount: function() {
        N.pushMainHandler = (data) => {
            this.setState({ "data": data })
        };
    },
    render: function() {
        return (
            <div id = "cup_main">
            {this.state.data.map(function(child) {
                    return <Leaf key = {child.id} data = {child}/>;
                })
            }
            <AddNew_Button/>
            </div>
        );
    }
});

TreeSub = React.createClass({
    getInitialState: function() {
        if (this.props.data.children == undefined)
            this.props.data.children = [];
        return { "data": this.props.data };
    },
    componentWillMount: function() {
        N.pushSubHandler = (data) => {
            this.setState({ "data": data })
        };
    },
    render: function() {
        return (
            <div id = "cup_sub_container">
                <Arrow/>
                <SubNameInput value = {this.state.data.name} tag = {this.state.data.id}/>
                <SubCheckDiv tag = {this.state.data.id} toggle = {this.state.data.checked}/>

                <div id = "cup_sub">
                {this.state.data.children.map(function(child) {
                return <Leaf key = {child.id} data = {child}/>;
            })}
                <AddNew_Button />
                </div>
            </div>
        );
    }
});

Arrow = React.createClass({
    handleClick: function() {
        var temp = STATUS.subpageId.toString().split("-");
        if (temp.length <= 1)
            returnToMain();
        else
            expand_card(temp.slice(0, -1).join("-"));
    },
    render: function() {
        return (
            <img id="arrowOut" src="..\img\arrowOut.png" onClick = {this.handleClick}/>
        )
    }
});

SubNameInput = React.createClass({
    getInitialState: function() {
        return {
            value: this.props.value,
        }
    },
    componentWillReceiveProps: function(props){
        this.setState({value:props.value});
    },
    handleChange: function(event) {
        this.setState({ value: event.target.value });
        N.updateName(this.props.tag, event.target.value);
        N.saveAll();
        N.push();
    },
    render: function() {
        return (
            <input value = {this.state.value} type = "text" class="cup_title" id="cup_sub_title" maxLength="20" onChange = {this.handleChange}/>
        )
    }
});

SubCheckDiv = React.createClass({
    render: function() {
        return (
            <div id="sub_checkDiv" class="box fade but_orange"></div>)
    }
})

Leaf = React.createClass({
    getInitialState: function() {
        return this.props.data;
    },
    render: function() {
        var idString = "card_" + this.state.id;
        var classString = 'inline card ' + N.valueToColorClass(this.state.value);
        return (
            <div id = {idString} className = {classString}>
                <LeafTop data = {this.props.data}/>
                <div className = "card_b">
                <LeafBox data = {this.props.data}/>
                </div>
            </div>
        );
    }
});

LeafTop = React.createClass({
    getInitialState: function() {
        return this.props.data;
    },
    render: function() {
        return (
            <div className = "card_t">
                <LeafNameInput value = {this.state.name} tag = {this.state.id}/>
                <div className = "card_ctrl">
                <LeafCtrlD tag = {this.state.id}/>
                <LeafCtrlE tag = {this.state.id}/>
                </div>
            </div>
        )
    }
});

LeafNameInput = React.createClass({
    getInitialState: function() {
        return {
            value: this.props.value,
        }
    },
    componentWillReceiveProps: function(props){
        this.setState({value:props.value});
    },
    handleChange: function(event) {
        this.setState({ value: event.target.value });
        N.updateName(this.props.tag, event.target.value);
        N.saveAll();
        N.push();
    },
    render: function() {
        return (
            <input maxLength="20" 
            value = {this.state.value}
            onChange = {this.handleChange}/>
        )
    }
});

LeafCtrlE = React.createClass({
    handleClick: function(event) {
        expand_card(this.props.tag);
        N.saveAll();
        N.push();
    },
    render: function() {
        return (
            <div className = "but_ed" onClick = {this.handleClick}/>
        );
    }
});

LeafCtrlD = React.createClass({
    handleClick: function() {
        N.delete_card(this.props.tag);
        N.saveAll();
        N.push();
    },
    render: function() {
        return (
            <div className = "but_del" onClick = {this.handleClick}/>
        );
    }
})

LeafBox = React.createClass({
    getInitialState: function() {
        return this.props.data;
    },
    handleClick: function() {
        N.flip_check(this.state.id);
        N.push();
        N.saveAll();
    },
    render: function() {
        var data = this.state;
        var classString = "fade box " + bToCClass(data.checked);
        var tagString = "fade boxTag";
        if (data.children.length == 0)
            tagString += " childlessBoxTag";
        var idString = "box_" + data.id;

        return (
            <div className = {classString} id = {idString} title = {this.props.data.name}>
                <div className = {tagString} onClick = {this.handleClick}></div>
                {data.children.map(function(child) {
                    return <LeafBox key = {child.id} data = {child}/>;
                })}
            </div>
        )
    }
});



AddNew_Button = React.createClass({
    handleClick: function() {
        if (STATUS.subMode) {

        } else {
            var _id = N.nextId();
            var _array = mainNode[STATUS.categ];
            _array.push(N.create({ "name": "New Task", "id": _id }));
            N.saveAll();
            N.push();
        }
    },
    render: function() {
        return (
            <div id="add_card" className="inline card" onClick = {this.handleClick}>
                <img src="../img/plus.png"/>
            </div>
        )
    }
})
