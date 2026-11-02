import React from 'react'
import { Link } from 'react-router-dom'

const ShowHistory = () => {
    return (<>
        <div>ShowHistory</div>
        <Link to="/history/rental">הסטוריית השכרות</Link>
        <br />
        <Link to="/history/renters">פרטי שוכרים</Link>
        </>

    )
}

export default ShowHistory