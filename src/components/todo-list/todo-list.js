import React from 'react'
import TodoListItem from '../todo-list-item/'
import './todo-list.css'

const TodoList = ({
                      todos,
                      remove,
                      onToggleImportant,
                      onToggleDone
                  }) => {


    const elements = todos.map((item) => {

        const {_id, ...itemProps} = item

        return (
            <li className='list-group-item'
                key={_id}
            >
                <TodoListItem //

                    {...itemProps}

                    remove={remove}
                    onToggleImportant={() => onToggleImportant(_id)}
                    onToggleDone={() => onToggleDone(_id)}
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
