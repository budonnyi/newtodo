import React, {Component} from 'react'
// import ReactDOM from 'react-dom'

import AppHeader from '../app-header/'
import SearchPanel from '../search-panel/'
import TodoList from '../todo-list/'
import ItemStatusFilter from '../item-status-filter/'
import ItemAddForm from '../item-add-form'
import {apiUrl, apiRoutes} from '../../apiConfig'

import './App.css'

export default class App extends Component {

    maxId = 100;

    state = {
        todoData: [],
        todoList: null,
        term: '',
        filter: 'all' //active, all, done
    }

    createTodoItem(label) {
        return {
            label: label,
            important: false,
            done: false,
            id: this.maxId++
        }
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

            this.setState(({todoData}) => ({
                todoData: [...todoData, ...todoList]
            }));

        } catch (error) {
            alert(error.message);
        }
    };

    deleteItem = (id) => {
        this.setState(({todoData}) => {

            const idx = todoData.findIndex((el) => el.id === id)

            const newArray = [
                ...todoData.slice(0, idx),
                ...todoData.slice(idx + 1)
            ]

            return {
                todoData: newArray
            }
        })

        const requestUrl = apiUrl + apiRoutes.todo + `?id=${id}`;
        const {todoList} = this.state;

        fetch(requestUrl, {method: 'DELETE'})
            .then(res => {
                const {status} = res;

                if (status < 200 || status > 299) {
                    throw new Error(`Ошибка при удалении! Код: ${status}`);
                }

                const cleanTodoList = todoList.filter(todo => todo.id !== id);
                this.setState({todoList: cleanTodoList});

                alert(`Задача с id: ${id} удалена!`);
            })
            .catch(error => {
                console.log('catch error');
                console.error(error);
            });
    }

    onAddItem = (text) => {

        const newItem = this.createTodoItem(text)

        this.setState(({ todoData }) => {

            const newArray = [
                ...todoData,
                newItem
            ]

            // return {
            //     todoData: newArray
            // }

        })

        const requestUrl = apiUrl + apiRoutes.todo + `?label=${label}`;
        fetch(requestUrl, {method: 'POST'})
            .then(res => {
                const { status } = res;

                if (status < 200 || status > 299) {
                    throw new Error(`Ошибка при добавлении задачи. Код ${status}`);
                }

                return res.json();
            })
            .then(addedTodo => {
                addTodoCallback(addedTodo);
                this.setState({
                    label: '',
                    important: false,
                    done: false,
                    messages: 'Задача успешно добавлена!',
                    error: '',
                });
            })
            .catch(error => {
                console.error(error);
                this.setState({error: error.message, messages: ''});
            });
    }

    toggleProperty(arr, id, propName) {

        const idx = arr.findIndex((el) => el.id === id)

        const oldItem = arr[idx]
        const newItem = {
            ...oldItem,
            [propName]: !oldItem[propName]
        }

        return [
            ...arr.slice(0, idx),
            newItem,
            ...arr.slice(idx + 1)
        ]
    }

    onToggleImportant = (id) => {
        this.setState(({todoData}) => {
            return {
                todoData: this.toggleProperty(todoData, id, 'important')
            }
        })
    }

    onToggleDone = (id) => {
        this.setState(({todoData}) => {
            return {
                todoData: this.toggleProperty(todoData, id, 'done')
            }
        })
    }

    search(items, term) {

        if (term.length === '') {
            return items;
        }

        return items.filter((item) => {
            return item.label
                    .toLowerCase()
                    .indexOf(term.toLowerCase()) > -1
        })
    }

    onSearchChange = (term) => {
        this.setState({term})
    }

    filter(items, filter) {

        switch (filter) {
            case 'all':
                return items;
            case 'active':
                return items.filter((item) => !item.done);
            case 'done':
                return items.filter((item) => item.done);
            default:
                return items;
        }
    }

    onFilterChange = (filter) => {
        this.setState({filter})
    }

    render() {

        const {todoData, term, filter} = this.state

        const visibleItems = this.filter(
            this.search(todoData, term), filter)

        const doneCount = this.state.todoData
            .filter((el) => el.done).length

        const todoCount = this.state.todoData.length - doneCount

        return (

            <div className='todo-app'>
                <AppHeader toDo={todoCount} done={doneCount}/>

                <div className='top-panel d-flex'>
                    <SearchPanel
                        onSearchChange={this.onSearchChange}
                    />
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

                <ItemAddForm
                    onAddItem={this.onAddItem}
                />
            </div>

        )
    }
}
