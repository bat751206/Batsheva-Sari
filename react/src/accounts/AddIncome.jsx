import React from 'react'
import { useState } from 'react'

const AddIncome = () => {


    
    const [renter, setRenter] = useState('')

    const addIncome = async () => {
        try {
            const { data } = await axios.post(`http://127.0.0.1:7200/api/incomes`)
            setInfo(data)
        } catch (error) {
            console.log("err in conecting to the server please try again later")
        }

    }
    return (<>
        



    </>

    )
}

export default AddIncome