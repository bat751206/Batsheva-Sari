import { useState } from 'react'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom'
import './Auth.css'

const Register = () => {
    const navigate = useNavigate()
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const registerUser = async (event) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)
    const formData = new FormData(event.currentTarget)
    const username = formData.get('username')
    const password = formData.get('password')

        try {
            await axios.post('http://localhost:7200/api/auth/register', { username, password })
      navigate('/')
    } catch (requestError) {
      setError(requestError.response?.status === 409
        ? 'שם המשתמש הזה כבר קיים. בחרי שם אחר.'
        : 'לא הצלחנו ליצור את החשבון כרגע. נסי שוב בעוד רגע.')
    } finally {
      setIsSubmitting(false)
        }
    }

  return (
    <main className="auth-page" dir="rtl">
      <div className="auth-layout">
        <section className="auth-form-panel" aria-labelledby="register-title">
          <div className="auth-form-content">
            <Link to="/" className="auth-brand" aria-label="חזרה למסך ההתחברות">
              <span className="auth-brand-icon"><i className="pi pi-home" aria-hidden="true" /></span>
              <span>ניהול הבית</span>
            </Link>

            <div className="auth-heading">
              <span className="auth-eyebrow">מתחילות כאן</span>
              <h1 id="register-title">יצירת חשבון</h1>
              <p>הגדירי פרטי התחברות כדי לפתוח חשבון במערכת.</p>
            </div>

            <form className="auth-form" onSubmit={registerUser}>
              <label htmlFor="register-username">שם משתמש</label>
                            <input id="register-username" name="username" type="text" autoComplete="username" placeholder="בחרי שם משתמש" required />

              <label htmlFor="register-password">סיסמה</label>
              <div className="auth-password-wrap">
                                <input id="register-password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" placeholder="בחרי סיסמה" required />
                <button className="auth-password-toggle" type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? 'הסתרת סיסמה' : 'הצגת סיסמה'}>
                  <i className={`pi ${showPassword ? 'pi-eye-slash' : 'pi-eye'}`} aria-hidden="true" />
                </button>
              </div>

              {error && <p className="auth-error" role="alert">{error}</p>}
              <button className="auth-submit" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'יוצרות חשבון...' : 'יצירת חשבון'}
                {!isSubmitting && <i className="pi pi-arrow-left" aria-hidden="true" />}
              </button>
            </form>

            <p className="auth-switch-copy">כבר יש לך חשבון? <Link to="/">חזרה להתחברות</Link></p>
          </div>
        </section>

        <aside className="auth-visual" aria-label="חלל אירוח מואר ומזמין">
          <img className="auth-visual-image" src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1800&q=88" alt="סלון מואר עם חלונות רחבים ופינת ישיבה" />
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

export default Register