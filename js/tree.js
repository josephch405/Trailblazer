require("./params.js")
require("./base.js")

TreeNode = function(args) {

    this.name = '';
    this.checked = false;
    this.id = -1;
    this.rootId = -1;
    this.children = [];
    this.layer = -1;

    this.setup = function(input) {
        this.name = _.has(input, 'name') ? input.name : '';
        this.checked = _.has(input, 'checked') ? input.checked : false;
        this.id = _.has(input, 'id') ? input.id : -1;
        this.rootId = _.has(input, 'id') ? input.id.toString().split("-")[0] : -1;
        this.layer = _.has(input, 'id') ? input.id.toString().split("-").length : -1;
        if (_.has(input, 'children')) {
            for (var i = 0; i < input.children.length; i++) {
                this.children[i] = new TreeNode();
                this.children[i].setup(input.children[i]);
            }
        }
    };

    this.setup(args);

    //returns object as data only without the functions
    this.dataOnly = function() {
        var _item = {
            name: this.name,
            checked: this.checked,
            id: this.id,
            rootId: this.rootId,
            layer: this.layer,
            children: []
        };
        for (var i in this.children)
            _item.children[i] = this.children[i].dataOnly();
        return _item;
    };


    //CHILD MANAGEMENT
    this.addToChildren = function(input) {
        this.children.push(input);
    };

    this.createChild = function(name) {
        this.addToChildren(new TreeNode({ "name": name, "id": this.id + "-" + (this.children.length + 1) }));
    };

    this.gen_boxes = function(layer) {
        if (!layer) layer = 0;

        var txt = '';

        if (this.children.length > 0) {
            txt += divHeadGen({ "class": ("fade box " + bToCClass(this.checked)), "id": "box_" + this.id, "title": this.name }, STYLE.topPartition[layer]);
            txt += '</div>';
            txt += divHeadGen({}, STYLE.botPartition[layer]);

            var topWidth = 100 / (this.children.length);
            for (var i in this.children) {
                txt += '<div ';
                txt += ' style="left: ' + topWidth * i + '%; ';
                txt += 'width:' + topWidth + '%; ';

                if (i > 0) {
                    txt += 'border-left:' + STYLE.line[0] + ";";
                }

                txt += '">';
                txt += this.children[i].gen_boxes(layer + 1);
                txt += '</div>';
            }
            txt += '</div>';
        } else {
            txt += divHeadGen({ "class": "box fade " + bToCClass(this.checked), "id": "box_" + this.id, "title": this.name }, {});
            txt += '</div>';
        }
        return txt;
    };

    this.gen_card_inner = function() {
        var text = '<div style="height:30%; border-bottom: ' + STYLE.line[1] + '; box-shadow: 0px 2px 2px -2px; z-index: 3">';
        text += '<input style="text-align:center; padding-top:0%; width:94%;border:none;outline:none" maxlength="20" value = "' + this.name + '">';
        text += '<div style="text-align:center; width:6%; left:94%; border-left: ' + STYLE.line[1] + '">';

        if (this.layer < 3) {
            text += '<div class = "fade but_del" style="top: 0%; height:20%; border-bottom:' + STYLE.line[1] + '"></div>';
            text += '<div class = "fade but_ed" style="top: 20%; height:80%"></div>';
        } else {
            text += '<div class = "fade but_del" style="top: 0%; height:100%""></div>';
        }
        text += '</div>';
        text += '</div>';

        text += '<div style = "height:70%; top:30%">';
        text += this.gen_boxes();
        text += '</div>';

        return text;
    };

    this.gen_card = function() {
        var text = '<div id = "card_' + this.id + '" class="inline card">';
        text += this.gen_card_inner();
        text += '</div>';
        return text;
    };

    this.set_onclicks = function(propog) {
        //propogdown
        if (propog) {
            var _id = this.id;

            $("#box_" + _id).prop('onclick', null).off('click');
            $("#card_" + _id).find(".but_del").prop('onclick', null).off('click');
            $("#card_" + _id).find("input").prop('keyup', null).off('keyup');
            $("#card_" + _id).find(".but_ed").prop('keyup', null).off('click');

            $("#box_" + _id).click(function() {
                flip_check(_id);
                refresh_card(_id);
                set_onclicks(_id);
                save_all();
            });

            $("#card_" + _id).find(".but_del").click(function() {
                delete_card(_id);
            });

            $("#card_" + _id).find("input").keyup(function() {
                /*if (this.value.match(/[^0-9a-zA-Z" "]/g)) {
                     this.value = this.value.replace(/[^0-9a-zA-Z" "]/g, '');
                 } code for eliminating input by regex*/
                update_name(_id, this.value);
                save_all();
            });

            $("#card_" + _id).find(".but_ed").click(function() {
                expand_card(_id);
            });
            for (var i in this.children) {
                this.children[i].set_onclicks(true);
            }
        } else {
            findNode(this.rootId).set_onclicks(true);
        }
    };

    this.refresh_card = function() {
        var text = this.gen_card_inner();
        var target = "#card_" + this.id;
        $(target).html(text);
        if (this.parentId() != -1)
            findNode(this.parentId()).refresh_card();
    };

    this.flip_check = function() {
        this.checked = !this.checked;
        console.log(this.checked);
    };

    this.set_name = function(name) {
        this.name = name;
    };

    this.nextAvailableId = function() {
        var idList = [];
        for (var i = 0; i < this.children.length; i++) {
            var _array = this.children[i].id.split("-");

            idList.push(parseInt(_array[_array.length - 1]));
        }
        if (idList.length === 0) {
            return this.id + "-" + 1;
        } else {
            var _i = 1;
            while (idList.indexOf(_i) != -1) {
                _i++;
            }
            return this.id + "-" + _i;
        }
    };

    this.parentId = function() {
        var _id = this.id;
        if (typeof _id == "string") {
            _id = this.id.split("-");
            _id.splice(-1, 1);
            if (_id.length > 1)
                return _id.join("-");
            if (_id.length > 0)
                return _id;
        }
        return -1;
    };

    this.reset = function() {
        this.checked = false;
        for (var i in this.children)
            this.children[i].reset();
    };


    //Not used as of now, candidate for testing textfile saves
    this.JSONexport = function() {
        var returnText = JSON.stringify(this);
        return returnText;
    };

    this.JSONimport = function(string) {
        tempObject = JSON.parse(string);
        this.setup(tempObject);
    };
}

