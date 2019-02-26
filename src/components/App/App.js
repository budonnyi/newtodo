import React, {Component} from 'react';
// import ReactDOM from 'react-dom'

import AppHeader from '../app-header';
import SearchPanel from '../search-panel';
import TodoList from '../todo-list';
import ItemStatusFilter from '../item-status-filter';
import ItemAddForm from '../item-add-form';
import {apiUrl, apiRoutes} from '../../apiConfig';

import './App.css';

export default class App extends Component {
    maxId = 100;

    state = {
        todoData: [],
        todoList: null,
        term: '',
        filter: 'all' //active, all, done
    };

    // createTodoItem(label) {
    //     return {
    //         label: label,
    //         important: false,
    //         done: false,
    //     };
    // }

    componentDidMount() {
        if (!this.state.todoList) {
            this.loadTodos();
        }
    }

    loadTodos = async () => {
        try {
            const res = await fetch(apiUrl + apiRoutes.todo);
            const {data: todoList} = await res.json();

            if (!Array.isArray(todoList)) {
                throw new Error('loadTodos: todoList should be an array');
            }

            this.setState(({todoData}) => ({
                todoData: [...todoData, ...todoList]
            }));
        } catch (error) {
            alert(error.message);
        }
    };

    remove = async todoLabel => {
        try {
            const requestUrl = `${apiUrl}${apiRoutes.todo}`;

            const response = await fetch(requestUrl, {
                method: 'DELETE',
                headers: {
                    'content-type': 'application/json'
                },
                body: JSON.stringify({label: todoLabel})
            });

            if (!response.ok) {
                throw new Error(`Ошибка при удалении! Код: ${response.status}`);
            }

            this.setState(
                ({todoData}) => ({
                    todoData: todoData.filter(({label}) => label !== todoLabel)
                }),
                // () => {
                //     alert(`Задача с label: ${todoLabel} удалена!`);
                // }
            );
        } catch (error) {
            console.log('catch error');
            console.error(error);
        }
    };

    onAddItem = async label => {
        try {
            // const newItem = this.createTodoItem(label);
            //
            // this.setState(({ todoData }) => ({
            //     todoData: [...todoData, newItem]
            // }));

            const requestUrl = `${apiUrl}${apiRoutes.todo}`;
            const response = await fetch(requestUrl, {
                method: 'POST',
                headers: {
                    'content-type': 'application/json'
                },
                body: JSON.stringify({label})
            });

            if (!response.ok) {
                throw new Error(
                    `Ошибка при добавлении задачи. Код ${response.status}`
                );
            }

            const {data: todo} = await response.json();
            // addTodoCallback(addedTodo); ← этого метода вообще нет.
            this.setState(({todoData}) => ({
                todoData: [todo, ...todoData]
            }));
        } catch (error) {
            console.error(error);
            this.setState({error: error.message, messages: ''});
        }
    };

    toggleProperty = async (arr, id, propName) => {
        try {

            const idx = arr.findIndex(el => el._id === id);

            const oldItem = arr[idx];

            const requestUrl = `${apiUrl}${apiRoutes.todo}`;
            const response = await fetch(requestUrl, {
                method: 'PUT',
                headers: {
                    'content-type': 'application/json'
                },
                body: JSON.stringify({oldItem})
            });

            if (!response.ok) {
                throw new Error(
                    `Ошибка при добавлении задачи. Код ${response.status}`
                );
            }

            const {data: todo} = await response.json();

            // addTodoCallback(addedTodo); ← этого метода вообще нет.
            this.setState(({todoData}) => ({
                todoData: [todo, ...todoData]
            }));
            const newItem = {
                ...oldItem,
                [propName]: !oldItem[propName]
            };

            return [...arr.slice(0, idx), newItem, ...arr.slice(idx + 1)];
        } catch (error) {
            console.error(error);
            this.setState({error: error.message, messages: ''});
        }
    }

    onToggleImportant = id => {
        this.setState(({todoData}) => {
            return {
                todoData: this.toggleProperty(todoData, id, 'important')
            };
        });
    };

    onToggleDone = id => {
        this.setState(({todoData}) => {
            return {
                todoData: this.toggleProperty(todoData, id, 'done')
            };
        });
    };

    search(items, term) {
        if (term.length === '') {
            return items;
        }

        return items.filter(item => {
            return item.label.toLowerCase().indexOf(term.toLowerCase()) > -1;
        });
    }

    onSearchChange = term => {
        this.setState({term});
    };

    filter(items, filter) {
        switch (filter) {
            case 'all':
                return items;
            case 'active':
                return items.filter(item => !item.done);
            case 'done':
                return items.filter(item => item.done);
            default:
                return items;
        }
    }

    onFilterChange = filter => {
        this.setState({filter});
    };

    render() {
        const {todoData, term, filter} = this.state;

        const visibleItems = this.filter(this.search(todoData, term), filter);

        const doneCount = this.state.todoData.filter(el => el.done).length;

        const todoCount = this.state.todoData.length - doneCount;

        return (
            <div className="todo-app">
                <AppHeader toDo={todoCount} done={doneCount}/>

                <div className="top-panel d-flex">
                    <SearchPanel onSearchChange={this.onSearchChange}/>
                    <ItemStatusFilter
                        filter={filter}
                        onFilterChange={this.onFilterChange}
                    />
                </div>

                <TodoList
                    todos={visibleItems}
                    remove={this.remove}
                    onToggleImportant={this.onToggleImportant}
                    onToggleDone={this.onToggleDone}
                />

                <ItemAddForm onAddItem={this.onAddItem}/>
            </div>
        );
    }
}
