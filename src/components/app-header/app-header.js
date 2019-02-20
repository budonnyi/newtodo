import React from 'react'
import './app-header.css'

const AppHeader = ({toDo, done}) => {
    return (
        <div className='app-header'>
        <h1>My React ToDo list</h1>
            <h2>{toDo} осталось {done} сделано</h2>
        </div>
    )
}

export default AppHeader
