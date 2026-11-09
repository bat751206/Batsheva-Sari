import axios from 'axios'
import { useState } from 'react'

const SingleTodo = ({ todo, onTodoUpdated }) => {
    const [isComplete, setIsComplete] = useState(Boolean(todo.status))
    const changeStatus = async () => {
        try {
            const { data } = await axios.put('http://127.0.0.1:7200/api/todos', { title: todo.title })
            setIsComplete(Boolean(data.status))
            onTodoUpdated(data)

        }
        catch {
            console.log('Error in connecting to the database')

        }
    }
    return (
        <li className={`todo-item${isComplete ? ' todo-item-completed' : ''}`}>
            <label className="todo-check">
                <input type="checkbox" checked={isComplete} onChange={changeStatus} />
                <span className="todo-checkbox" aria-hidden="true" />
                <span className={`todo-title${isComplete ? ' todo-title-completed' : ''}`}>{todo.title}</span>
            </label>
            <span className="todo-item-meta">
                <span className={`todo-item-status${isComplete ? ' todo-item-status-completed' : ''}`}>
                    {isComplete ? 'הושלם' : 'לביצוע'}
                </span>
                
            </span>
        </li>
    )
}

export default SingleTodo