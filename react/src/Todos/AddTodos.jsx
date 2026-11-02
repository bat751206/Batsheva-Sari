import axios from 'axios'
import { useEffect, useState } from 'react'

const AddTodos = ({ todos, onTodoCreated, onTodoActivated, onClose }) => {
    const [isCreating, setIsCreating] = useState(false)
    const [title, setTitle] = useState('')
    const [isTemporary, setIsTemporary] = useState(false)
    const [error, setError] = useState('')
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        const closeOnEscape = (event) => {
            if (event.key !== 'Escape' || isSaving) return
            if (isCreating) {
                setIsCreating(false)
            } else {
                onClose()
            }
        }
        document.addEventListener('keydown', closeOnEscape)
        return () => document.removeEventListener('keydown', closeOnEscape)
    }, [isCreating, isSaving, onClose])

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

    const availableTodos = todos
        .filter((todo) => todo.isTemporary && !todo.show)
        .sort((first, second) => String(first.title || '').localeCompare(String(second.title || ''), 'he', { sensitivity: 'base' }))

    return (
        <div
            className="todos-add-backdrop"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget && !isCreating) onClose()
            }}
        >
        <section className="todos-section todos-library todos-add-dialog" role="dialog" aria-modal="true" aria-labelledby="available-todos-title">
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
                    <button
                        className="todos-add-dialog-close"
                        type="button"
                        onClick={onClose}
                        aria-label="סגירת רשימת המשימות"
                    >
                        ×
                    </button>
                </div>
            </div>

            {isCreating && (
                <div
                    className="todo-create-backdrop"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget && !isSaving) setIsCreating(false)
                    }}
                >
                    <section className="todo-create-dialog" role="dialog" aria-modal="true" aria-labelledby="todo-create-title" dir="rtl">
                        <header className="todo-create-dialog-header">
                            <h2 id="todo-create-title">משימה חדשה</h2>
                            <button
                                className="todo-create-dialog-close"
                                type="button"
                                onClick={() => setIsCreating(false)}
                                disabled={isSaving}
                                aria-label="סגירת חלונית הוספת משימה"
                            >×</button>
                        </header>
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
                    </section>
                </div>
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
        </div>
    )
}

export default AddTodos
