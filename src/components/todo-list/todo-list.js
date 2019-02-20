import React from 'react'
import TodoListItem from '../todo-list-item/'
import './todo-list.css'

const TodoList = ({
                      todos,
                      onDeleted,
                      onToggleImportant,
                      onToggleDone
                  }) => {


    const elements = todos.map((item) => {

        const {id, ...itemProps} = item

        return (
            <li className='list-group-item'
                key={id}
            >
                <TodoListItem //

                    {...itemProps}

                    onDeleted={() => onDeleted(id)}
                    onToggleImportant={() => onToggleImportant(id)}
                    onToggleDone={() => onToggleDone(id)}
                    // label={item.label}
                    // important={item.important}
                /></li>
        )
    })

    return (
        <ul className='list-group'>
            {elements}
        </ul>
    )
}

export default TodoList
