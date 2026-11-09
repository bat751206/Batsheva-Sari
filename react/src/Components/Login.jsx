import { useContext, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { jwtDecode } from 'jwt-decode'
import axios from 'axios'

import AuthContext from './AuthContext'
import bedroomImage from '../../../public/חדר שינה.JPG'
import './Auth.css'

const Login = () => {
    const { setIsAdmin } = useContext(AuthContext)
    const navigate = useNavigate()
    const [error, setError] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    const checkLogin = async (event) => {
        event.preventDefault()
        setError('')
        setIsSubmitting(true)
        const formData = new FormData(event.currentTarget)
        const username = formData.get('username')
        const password = formData.get('password')

        try {
            const { data } = await axios.post('http://localhost:7200/api/auth/login', { username, password })
            localStorage.setItem('accessToken', data.accessToken)
            setIsAdmin(jwtDecode(data.accessToken).roles === 'Admin')
            navigate('/home')
        } catch {
            setError('שם המשתמש או הסיסמה אינם נכונים. בדקי את הפרטים ונסי שוב.')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <main className="auth-page" dir="rtl">
            <div className="auth-layout auth-layout-split">
                <section className="auth-form-panel" aria-labelledby="login-title">
                    <div className="auth-form-content">
                        <Link to="/" className="auth-brand" aria-label="חזרה למסך ההתחברות">
                            <span className="auth-brand-icon"><i className="pi pi-home" aria-hidden="true" /></span>
                            <span>ניהול הבית</span>
                        </Link>

                        <div className="auth-heading">
                            <span className="auth-eyebrow">ברוכה השבה</span>
                            <h1 id="login-title">מתחברות וממשיכות</h1>
                            <p>היכנסי לחשבון כדי להמשיך לניהול השוטף.</p>
                        </div>

                        <form className="auth-form" onSubmit={checkLogin}>
                            <label htmlFor="login-username">שם משתמש</label>
                            <input id="login-username" name="username" type="text" autoComplete="username" placeholder="הקלידי את שם המשתמש" required />

                            <label htmlFor="login-password">סיסמה</label>
                            <div className="auth-password-wrap">
                                <input id="login-password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" placeholder="הקלידי את הסיסמה" required />
                                <button className="auth-password-toggle" type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? 'הסתרת סיסמה' : 'הצגת סיסמה'}>
                                    <i className={`pi ${showPassword ? 'pi-eye-slash' : 'pi-eye'}`} aria-hidden="true" />
                                </button>
                            </div>

                            {error && <p className="auth-error" role="alert">{error}</p>}
                            <button className="auth-submit" type="submit" disabled={isSubmitting}>
                                {isSubmitting ? 'מתחברות...' : 'כניסה למערכת'}
                                {!isSubmitting && <i className="pi pi-arrow-left" aria-hidden="true" />}
                            </button>
                        </form>

                        <p className="auth-switch-copy">עדיין אין לך חשבון? <Link to="/register">יצירת חשבון</Link></p>
                    </div>
                </section>

                <aside className="auth-visual" aria-label="חדר שינה מואר עם חלונות רחבים">
                    <img className="auth-visual-image" src={bedroomImage} alt="חדר שינה עם מיטה זוגית וחלונות גדולים" />
                    <div className="auth-visual-content">
                        <span className="auth-visual-kicker">ניהול השכרות, בפשטות</span>
                        <p>כל הפרטים החשובים,<br />במקום אחד.</p>
                        <span className="auth-visual-rule" aria-hidden="true" />
                    </div>
                </aside>
            </div>
        </main>
    )
}

export default Login