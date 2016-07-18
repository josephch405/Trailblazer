T = {
    saveAll: function() {
        chrome.storage.local.set({ 'taskData': taskData }, function() {});
    },

    loadAll: function(_obj) {
        taskData = _obj ? _obj : [];
        T.render();
    },
    render: function() {
        ReactDOM.render(
            <TaskList data={taskData} />,
            document.getElementById('taskList')
        );
    },
    nextId: function() {
        var id = 1;
        while (findById(taskData, id)) {
            id += 1;
        }
        return id;
    }
}

taskData = [];

TaskList = React.createClass({
    render: function() {
        var taskNodes = !this.props.data ? "" : this.props.data.map(function(task) {
            return (
                <Task text={task.text} 
                key={task.id} id = {task.id}
                check = {task.check}/>
            );
        });

        return (
            <table id = "taskTable">
                <tbody>{ taskNodes }
                </tbody>
                <tfoot><tr><td></td><td> <AddTask/></td></tr>
                </tfoot>
            </table>
        );
    }
});

Task = React.createClass({
    render: function() {
        return (
            <tr className="task">
            <TaskDelete {...this.props}/>
            <td className = "taskName"><TaskName {...this.props}/></td>
            <TaskChecked {...this.props}/>
        </tr>
        );
    }
});

TaskName = React.createClass({
    getInitialState: function() {
        return { value: this.props.text };
    },
    handleChange: function(event) {
        this.setState({ value: event.target.value });
        findById(taskData, this.props.id).text = event.target.value;
        //this actually updates the data - need better solution
        T.saveAll();
        //then pushes to storage
    },
    render: function() {
        return (
            <input 
            maxLength = '30'
            value = {this.state.value}
            onChange = {this.handleChange}/>
        );
    }
})

TaskChecked = React.createClass({
    getInitialState: function() {
        return { check: false };
    },
    componentDidMount: function() {
        this.setState({ check: this.props.check });
    },
    handleClick: function(event) { 
        this.setState({check: !this.state.check});
        findById(taskData, this.props.id).check =
            !(findById(taskData, this.props.id).check);
        T.saveAll();
    },
    render: function() {
        var a = bToCClass(this.state.check);
        a += " taskCheck";
        return (
            <td className = {a} onClick={this.handleClick}></td>
        );
    }
})

TaskDelete = React.createClass({
    handleClick: function(event) {
        var ind = findIndexById(taskData, this.props.id);
        taskData.splice(ind, 1);
        T.saveAll();
        T.render(); 
    },
    render: function() {
        return (
            <td className = 'taskDelete' onClick={this.handleClick}></td>
        );
    }
})

AddTask = React.createClass({
    handleClick: function(event) {
        taskData.push({
            id: T.nextId(),
            text: 'Task',
            check: false
        });
        T.saveAll();
        T.render();
    },
    render: function() {
        return (
            <img className = 'addTask' onClick={this.handleClick} src = '..\img\plus.png'/>
        )
    }
})
