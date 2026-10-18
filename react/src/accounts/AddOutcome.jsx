import React from 'react'
import { useState } from 'react'
import axios from "axios" 

const AddOutcome = ({setAddNew}) => {

    const [type, setType] = useState('מזומן')

    const addOutcome = async (e) => {
        e.preventDefault()
        const data = new FormData(e.target)
        const info = Object.fromEntries(data.entries())
        
        const obj = {
            date: info.date,
            sum: Number(info.sum),
            description: info.description,
            paymentType: info.paymentType
        }
        try {
            await axios.post(`http://127.0.0.1:7200/api/outcomes`, obj)
            console.log("adding");
            
        } catch (error) {
           console.log(error)
        }
        setAddNew(false)
    }
    return (<><h2>הוסף הוצאה</h2>
        <form onSubmit={addOutcome}>
            <input name="date" type="text" placeholder='תאריך' />
            <input name="sum"type="number" placeholder='סכום' />
            <input name="description"type="text" placeholder='תיאור' />
            <select name="paymentType" id="option" value={type} onChange={(e) => { setType(e.target.value) }} required="true" placeholder="אופן תשלום">
                <option value="מזומן">מזומן</option>
                <option value="העברה">העברה</option>
                <option value="צ'ק">צ'ק</option>
                <option value="אשראי">אשראי</option>
                <option value="אשראי דיירקט">אשראי דיירקט</option>
            </select>
           
            <button type='submit'>שליחה</button>
        </form></>
    )
}

export default AddOutcome