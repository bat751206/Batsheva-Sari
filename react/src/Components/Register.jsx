import { useState } from 'react'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom'
import './Auth.css'

const Register = () => {
    const navigate = useNavigate()
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  // שומרת את כתובת המייל האופציונלית בזמן מילוי הטופס.
  const [email, setEmail] = useState('')
  // משאירה את ההתראות כבויות עד שהמשתמשת מאשרת אותן במפורש.
  const [emailNotifications, setEmailNotifications] = useState(false)

  const registerUser = async (event) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)
    const formData = new FormData(event.currentTarget)
    const username = formData.get('username')
    const password = formData.get('password')
    // מסירה רווחים מיותרים לפני שליחת הכתובת האופציונלית לשרת.
    const cleanEmail = email.trim()

      // יוצרת חשבון עם כתובת המייל והסכמה מפורשת לקבלת התראות.
        try {
            await axios.post('http://localhost:7200/api/auth/register', {
      username, // שולחת לשרת את שם המשתמש שהוזן בטופס.
      password, // שולחת את הסיסמה כדי שהשרת יצפין אותה לפני השמירה.
      email: cleanEmail, // שולחת את כתובת המייל לאחר ניקוי רווחים, או מחרוזת ריקה.
      emailNotifications: Boolean(cleanEmail && emailNotifications) // מאשרת התראות רק אם הוזן מייל וסומנה תיבת ההסכמה.
      })
      navigate('/')
    } catch (requestError) {
      setError(requestError.response?.status === 409
        ? 'שם המשתמש הזה כבר קיים. בחרי שם אחר.'
        : 'לא הצלחנו ליצור את החשבון כרגע. נסי שוב בעוד רגע.')
    } finally {
      setIsSubmitting(false)
        }
    }

  // מגדירה בנפרד את מאפייני שדה המייל כדי להסביר את תפקידו של כל אחד מהם.
  const emailInputProps = {
    id: 'register-email', // מקשרת בין שדה המייל לתווית שמוצגת לידו.
    name: 'email', // משתמשת בשם השדה שהשרת מצפה לקבל.
    type: 'email', // מפעילה בדיקת תקינות בסיסית של כתובת בדפדפן.
    autoComplete: 'email', // מאפשרת לדפדפן להציע כתובת שמורה.
    placeholder: 'name@example.com', // מציגה דוגמה למבנה הכתובת המצופה.
    value: email, // מסנכרנת את תוכן השדה עם מצב React.
    onChange: (event) => { // מעדכנת את מצב הכתובת בכל הקלדה.
      setEmail(event.target.value) // שומרת את הערך החדש שהוקלד.
      if (!event.target.value.trim()) setEmailNotifications(false) // מבטלת הסכמה אם כתובת המייל נמחקה.
    }
  }

  // מגדירה את התנהגות תיבת הסימון ואת מצב ההסכמה לקבלת מיילים.
  const notificationCheckboxProps = {
    className: 'auth-notification-checkbox', // מחילה על התיבה את העיצוב הייעודי שלה.
    type: 'checkbox', // יוצרת פקד בחירה של כן או לא.
    checked: emailNotifications, // משקפת אם המשתמשת בחרה לקבל התראות.
    disabled: !email.trim(), // מונעת אישור התראות לפני הזנת כתובת.
    onChange: (event) => setEmailNotifications(event.target.checked) // שומרת את הבחירה המפורשת של המשתמשת.
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

              {/* מציגה את התווית ואת שדה המייל האופציונלי שהוגדרו למעלה. */}
              <label htmlFor="register-email">כתובת מייל (לא חובה)</label>
              <input {...emailInputProps} />

              {/* מקבצת את תיבת האישור עם הטקסט שמסביר את משמעותה. */}
              <label className="auth-notification-consent">
                {/* מציגה את תיבת ההסכמה לפי המאפיינים והמצב שהוגדרו למעלה. */}
                <input {...notificationCheckboxProps} />
                <span>אני מאשרת לקבל התראות למייל</span>
              </label>

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