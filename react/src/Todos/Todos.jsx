import { useEffect, useState } from 'react'
import axios from 'axios'
import SingleTodo from './SingleTodo'
import AddTodos from './AddTodos'
import './Todos.css'

const Todos = () => {
    const [info, setInfo] = useState([])
    const [todoWindowOpen, setTodoWindowOpen] = useState(false)
    const [add, setAdd] = useState(false)
    const [current, setCurrent] = useState(null)
    const getData = async () => {
        try {
            const { data } = await axios.get('http://127.0.0.1:7200/api/todos')
            setInfo(data.todos)
            setTodoWindowOpen(data.todoWindowOpen)
            const { data: currentRent } = await axios.get('http://127.0.0.1:7200/api/rents/nearest')
            setCurrent(currentRent)
        }
        catch {
            console.log('Error in connecting to the database')
        }
    }

    useEffect(() => {
        getData()
    }, [])
     
    const visibleTodos = todoWindowOpen
        ? info.filter((todo) => todo.show)
        : []
    const activeTodos = visibleTodos.filter((todo) => !todo.status)
    const availableTodos = info.filter((todo) => !todo.show)

    return (
        <section className="todos-page" dir="rtl">
            <header className="todos-header">
                <div>
                    <p className="todos-eyebrow">עושות סדר ביום</p>
                    <h1>המשימות שלנו</h1>
                </div>
                <button
                    className="todos-add-button"
                    type="button"
                    disabled={activeTodos.length === 0}
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
                <div className="todos-stat todos-rental-stats">
                    <div className="todos-rental-stat">
                        <strong>{current?.numOfBeds || 0}</strong>
                        <span>מספר מיטות</span>
                    </div>
                    <div className="todos-rental-stat">
                        <strong>{current?.numOfBabyBeds || 0}</strong>
                        <span> מספר מיטות תינוק</span>
                    </div>
                    <div className="todos-rental-stat">
                        <strong>{current?.numOfNights || 0}</strong>
                        <span>מספר לילות</span>
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

                {visibleTodos.length > 0 ? (
                    <ul className="todos-list">
                        {visibleTodos.map((todo) => (
                            <SingleTodo
                                key={todo._id ?? todo.id ?? todo.title}
                                todo={todo}
                                onTodoUpdated={(updatedTodo) => setInfo((current) => current.map((item) => (
                                    item._id === updatedTodo._id ? updatedTodo : item
                                )))}
                            />
                        ))}
                    </ul>
                ) : (
                    <div className="todos-empty">
                        <span className="todos-empty-icon" aria-hidden="true">✓</span>
                        <p>אין משימות לביצוע</p>
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