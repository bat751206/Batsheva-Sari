import { useEffect, useState } from 'react'
import axios from 'axios'
import SingleTodo from './SingleTodo'
import AddTodos from './AddTodos'
import './Todos.css'

const Todos = () => {
    const [info, setInfo] = useState([])
    const [add, setAdd] = useState(false)
    const getData = async () => {
        try {
            const { data } = await axios.get('http://127.0.0.1:7200/api/todos')
            setInfo(data)
        }
        catch {
            console.log('Error in connecting to the database')
        }
    }

    useEffect(() => {
        getData()
    }, [])

    const activeTodos = info.filter((todo) => todo.show)
    const availableTodos = info.filter((todo) => !todo.show)

    return (
        <section className="todos-page" dir="rtl">
            <header className="todos-header">
                <div>
                    <p className="todos-eyebrow">עושות סדר ביום</p>
                    <h1>המשימות שלנו</h1>
                    <p className="todos-description">כל מה שצריך לעשות, במקום אחד.</p>
                </div>
                <button
                    className="todos-add-button"
                    type="button"
                    onClick={() => setAdd(!add)}
                    aria-expanded={add}
                >
                    <span aria-hidden="true">{add ? '−' : '+'}</span>
                    {add ? 'סגירת רשימת המשימות' : 'הוספת משימה לביצוע'}
                </button>
            </header>

            <div className="todos-summary" aria-label="סיכום משימות">
                <div className="todos-stat">
                    <span className="todos-stat-icon" aria-hidden="true">✓</span>
                    <div>
                        <strong>{activeTodos.length}</strong>
                        <span>משימות לביצוע</span>
                    </div>
                </div>
                <div className="todos-stat">
                    <span className="todos-stat-icon todos-stat-icon-muted" aria-hidden="true">＋</span>
                    <div>
                        <strong>{availableTodos.length}</strong>
                        <span>משימות זמינות</span>
                    </div>
                </div>
            </div>

            <section className="todos-section" aria-labelledby="active-todos-title">
                <div className="todos-section-heading">
                    <div>
                        <h2 id="active-todos-title">המשימות לביצוע</h2>
                        <p>סמני משימה לאחר שסיימת אותה</p>
                    </div>
                    <span className="todos-count">{activeTodos.length}</span>
                </div>

                {activeTodos.length > 0 ? (
                    <ul className="todos-list">
                        {activeTodos.map((todo) => (
                            <SingleTodo key={todo._id ?? todo.id ?? todo.title} todo={todo} />
                        ))}
                    </ul>
                ) : (
                    <div className="todos-empty">
                        <span className="todos-empty-icon" aria-hidden="true">✓</span>
                        <p>אין כרגע משימות לביצוע</p>
                        <span>אפשר להוסיף משימה מהרשימה הזמינה.</span>
                    </div>
                )}
            </section>

            {add && (
                <AddTodos
                    todos={info}
                    onTodoCreated={(todo) => setInfo((current) => [...current, todo])}
                    onTodoActivated={(todo) => setInfo((current) => current.map((item) => (
                        item._id === todo._id ? todo : item
                    )))}
                />
            )}
        </section>
    )
}

export default Todos