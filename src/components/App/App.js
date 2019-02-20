import React, { Component } from 'react';
// import ReactDOM from 'react-dom'

import AppHeader from '../app-header';
import SearchPanel from '../search-panel';
import TodoList from '../todo-list';
import ItemStatusFilter from '../item-status-filter';
import ItemAddForm from '../item-add-form';
import { apiUrl, apiRoutes } from '../../apiConfig';

import './App.css';

export default class App extends Component {
    maxId = 100;

    state = {
        todoData: [],
        todoList: null,
        term: '',
        filter: 'all' //active, all, done
    };

    createTodoItem(label) {
        return {
            label: label,
            important: false,
            done: false,
            id: this.maxId++
        };
    }

    componentDidMount() {
        if (!this.state.todoList) {
            this.loadTodos();
        }
    }

    loadTodos = async () => {
        try {
            const res = await fetch(apiUrl + apiRoutes.todo);
            const todoList = await res.json();

            if (!Array.isArray(todoList)) {
                throw new Error('loadTodos: todoList should be an array');
            }

            this.setState(({ todoData }) => ({
                todoData: [...todoData, ...todoList]
            }));
        } catch (error) {
            alert(error.message);
        }
    };

    deleteItem = async todoId => {
        try {
            const requestUrl = `${apiUrl}${apiRoutes.todo}?id=${todoId}`;

            const response = await fetch(requestUrl, { method: 'DELETE' });

            if (!response.ok) {
                throw new Error(`Ошибка при удалении! Код: ${response.status}`);
            }

            this.setState(
                ({ todoData }) => ({
                    todoData: todoData.filter(({ id }) => todoId !== id)
                }),
                () => {
                    alert(`Задача с id: ${todoId} удалена!`);
                }
            );
        } catch (error) {
            console.log('catch error');
            console.error(error);
        }
    };

    onAddItem = async text => {
        try {
            const newItem = this.createTodoItem(text);

            this.setState(({ todoData }) => ({
                todoData: [...todoData, newItem]
            }));

            const requestUrl = `${apiUrl}${apiRoutes.todo}?label=${text}`;
            const response = await fetch(requestUrl, { method: 'POST' });

            if (!response.ok) {
                throw new Error(
                    `Ошибка при добавлении задачи. Код ${response.status}`
                );
            }

            const addedTodo = await response.json();
            // addTodoCallback(addedTodo); ← этого метода вообще нет.
            this.setState({
                label: '',
                important: false,
                done: false,
                messages: 'Задача успешно добавлена!',
                error: ''
            });
        } catch (error) {
            console.error(error);
            this.setState({ error: error.message, messages: '' });
        }
    };

    toggleProperty(arr, id, propName) {
        const idx = arr.findIndex(el => el.id === id);

        const oldItem = arr[idx];
        const newItem = {
            ...oldItem,
            [propName]: !oldItem[propName]
        };

        return [...arr.slice(0, idx), newItem, ...arr.slice(idx + 1)];
    }

    onToggleImportant = id => {
        this.setState(({ todoData }) => {
            return {
                todoData: this.toggleProperty(todoData, id, 'important')
            };
        });
    };

    onToggleDone = id => {
        this.setState(({ todoData }) => {
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
        this.setState({ term });
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
        this.setState({ filter });
    };

    render() {
        const { todoData, term, filter } = this.state;

        const visibleItems = this.filter(this.search(todoData, term), filter);

        const doneCount = this.state.todoData.filter(el => el.done).length;

        const todoCount = this.state.todoData.length - doneCount;

        return (
            <div className="todo-app">
                <AppHeader toDo={todoCount} done={doneCount} />

                <div className="top-panel d-flex">
                    <SearchPanel onSearchChange={this.onSearchChange} />
                    <ItemStatusFilter
                        filter={filter}
                        onFilterChange={this.onFilterChange}
                    />
                </div>

                <TodoList
                    todos={visibleItems}
                    onDeleted={this.deleteItem}
                    onToggleImportant={this.onToggleImportant}
                    onToggleDone={this.onToggleDone}
                />

                <ItemAddForm onAddItem={this.onAddItem} />
            </div>
        );
    }
}