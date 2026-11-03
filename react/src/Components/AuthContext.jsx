import { createContext } from 'react'

const AuthContext = createContext({ isAdmin: false, setIsAdmin: () => {} })

export default AuthContext