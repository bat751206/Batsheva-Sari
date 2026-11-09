import { useState } from 'react'
import axios from 'axios'
import './AddAdmin.css'

const AddAdmin = () => {
	// שומר את ערכי הטופס בזמן יצירת חשבון מנהל.
	const [username, setUsername] = useState('')
	const [password, setPassword] = useState('')
	const [email, setEmail] = useState('')
	const [emailNotifications, setEmailNotifications] = useState(false)
	const [isSaving, setIsSaving] = useState(false)
	const [error, setError] = useState('')
	const [success, setSuccess] = useState('')

	// שולח את פרטי החשבון לנתיב שמוגן בצד השרת למנהלים בלבד.
	const createAdmin = async (event) => {
		event.preventDefault()
		setIsSaving(true)
		setError('')
		setSuccess('')

		try {
			// מבקש מהשרת ליצור חשבון מנהל ולשמור את הסכמת המייל אם נבחרה.
			const { data } = await axios.post('http://127.0.0.1:7200/api/users/admin', {
				username: username.trim(),
				password,
				email: email.trim(),
				emailNotifications: Boolean(email.trim() && emailNotifications)
			})
			setSuccess(`חשבון המנהל ${data.username} נוצר בהצלחה`)
			setUsername('')
			setPassword('')
			setEmail('')
			setEmailNotifications(false)
		} catch (requestError) {
			setError(requestError.response?.data?.message || 'לא הצלחנו ליצור את חשבון המנהל')
		} finally {
			setIsSaving(false)
		}
	}

	return (
		<main className="add-admin-page" dir="rtl">
			<header className="add-admin-header">
				<p className="add-admin-eyebrow">הגדרות מערכת</p>
				<h1>הוספת מנהל</h1>
				<p>יצירת חשבון מנהל חדש למערכת.</p>
			</header>

			<form className="add-admin-form" onSubmit={createAdmin}>
				<label htmlFor="admin-username">שם משתמש</label>
				<input
					id="admin-username"
					type="text"
					autoComplete="username"
					value={username}
					onChange={(event) => setUsername(event.target.value)}
					required
				/>

				<label htmlFor="admin-password">סיסמה</label>
				<input
					id="admin-password"
					type="password"
					autoComplete="new-password"
					value={password}
					onChange={(event) => setPassword(event.target.value)}
					minLength={8}
					required
				/>
				<span className="add-admin-hint">לפחות 8 תווים</span>

				<label htmlFor="admin-email">כתובת מייל (לא חובה)</label>
				<input
					id="admin-email"
					type="email"
					autoComplete="email"
					value={email}
					onChange={(event) => {
						setEmail(event.target.value)
						if (!event.target.value.trim()) setEmailNotifications(false)
					}}
				/>

				<label className="add-admin-consent">
					<input
						type="checkbox"
						checked={emailNotifications}
						disabled={!email.trim()}
						onChange={(event) => setEmailNotifications(event.target.checked)}
					/>
					<span>אישור קבלת התראות למייל</span>
				</label>

				{error && <p className="add-admin-message add-admin-error" role="alert">{error}</p>}
				{success && <p className="add-admin-message add-admin-success" role="status">{success}</p>}

				<button className="add-admin-submit" type="submit" disabled={isSaving}>
					{isSaving ? 'יוצר חשבון...' : 'יצירת מנהל'}
				</button>
			</form>
		</main>
	)
}

export default AddAdmin
