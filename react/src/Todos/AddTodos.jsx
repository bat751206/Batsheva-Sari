import axios from 'axios'
import { useState } from 'react'

const AddTodos = ({ todos, onTodoCreated, onTodoActivated }) => {
    const [isCreating, setIsCreating] = useState(false)
    const [title, setTitle] = useState('')
    const [isTemporary, setIsTemporary] = useState(false)
    const [error, setError] = useState('')
    const [isSaving, setIsSaving] = useState(false)

    const changeShow = async (todo) => {
        try {
            const { data } = await axios.put('http://127.0.0.1:7200/api/todos/show', { title: todo.title })
            onTodoActivated(data)
        }
        catch {
            console.log('Error in connecting to the database')
        }
    }

    const createTodo = async (event) => {
        event.preventDefault()
        const cleanTitle = title.trim()
        if (!cleanTitle) {
            setError('יש להזין שם למשימה')
            return
        }

        setIsSaving(true)
        setError('')
        try {
            const { data } = await axios.post('http://127.0.0.1:7200/api/todos', {
                title: cleanTitle,
                isTemporary
            })
            onTodoCreated(data)
            setTitle('')
            setIsCreating(false)
        }
        catch (requestError) {
            setError(requestError.response?.data?.message ?? 'לא ניתן לשמור את המשימה כרגע')
        }
        finally {
            setIsSaving(false)
        }
    }

    const availableTodos = todos.filter((todo) => !todo.show)

    return (
        <section className="todos-section todos-library" aria-labelledby="available-todos-title">
            <div className="todos-section-heading">
                <div>
                    <h2 id="available-todos-title">משימות שאפשר להוסיף</h2>
                    <p>בחרי משימה כדי להוסיף אותה לרשימת הביצוע</p>
                </div>
                <div className="todo-library-actions">
                    <span className="todos-count">{availableTodos.length}</span>
                    <button
                        className="todo-create-toggle"
                        type="button"
                        aria-expanded={isCreating}
                        aria-controls="todo-create-form"
                        onClick={() => {
                            setIsCreating(!isCreating)
                            setError('')
                        }}
                    >
                        <span aria-hidden="true">{isCreating ? '−' : '+'}</span>
                        {isCreating ? 'ביטול' : 'משימה חדשה'}
                    </button>
                </div>
            </div>

            {isCreating && (
                <form id="todo-create-form" className="todo-create-form" onSubmit={createTodo}>
                    <label className="todo-create-label" htmlFor="todo-title-input">שם המשימה</label>
                    <input
                        id="todo-title-input"
                        className="todo-create-input"
                        type="text"
                        value={title}
                        onChange={(event) => setTitle(event.target.value)}
                        maxLength={120}
                        autoFocus
                    />

                    <fieldset className="todo-type-options">
                        <legend>סוג המשימה</legend>
                        <label>
                            <input
                                type="radio"
                                name="todo-type"
                                checked={isTemporary}
                                onChange={() => setIsTemporary(true)}
                            />
                            זמנית
                        </label>
                        <label>
                            <input
                                type="radio"
                                name="todo-type"
                                checked={!isTemporary}
                                onChange={() => setIsTemporary(false)}
                            />
                            קבועה
                        </label>
                    </fieldset>

                    {error && <p className="todo-create-error" role="alert">{error}</p>}
                    <button className="todo-create-submit" type="submit" disabled={isSaving}>
                        {isSaving ? 'שומרת...' : 'שמירת משימה'}
                    </button>
                </form>
            )}

            {availableTodos.length > 0 ? (
                <ul className="todos-list">
                    {availableTodos.map((todo) => (
                        <li className="todo-item" key={todo._id ?? todo.id ?? todo.title}>
                            <label className="todo-check">
                                <input type="checkbox" onChange={() => changeShow(todo)} />
                                <span className="todo-checkbox" aria-hidden="true" />
                                <span className="todo-title">{todo.title}</span>
                            </label>
                            <span className="todo-item-meta">
                                <span className="todo-item-status todo-item-status-available">להוספה</span>
                                <span className={`todo-item-type${todo.isTemporary ? ' todo-item-type-temporary' : ''}`}>
                                    {todo.isTemporary ? 'זמנית' : 'קבועה'}
                                </span>
                            </span>
                        </li>
                    ))}
                </ul>
            ) : (
                <div className="todos-empty todos-library-empty">
                    <p>אין כרגע משימות זמינות</p>
                </div>
            )}
        </section>
    )
}

export default AddTodos
