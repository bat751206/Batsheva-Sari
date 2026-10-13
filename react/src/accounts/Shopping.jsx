import React from 'react'
import { useState, useEffect } from 'react'
import axios from "axios"


const Shopping = ({ setAddShopping }) => {
    const [type, setType] = useState('מזומן')
    const addOutcome = async (e) => {
        e.preventDefault()
        const data = new FormData(e.target)
        const info = Object.fromEntries(data.entries())

        let obj = {
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
        obj = {
            product: info.description,
            addAmount: Number(info.amount)
        }
        try {
            await axios.put(`http://127.0.0.1:7200/api/amount/add`, obj)
            console.log("adding");
            
        }
        catch(error){
            console.log(error);
            
        }
        setAddShopping(false)
    }
    return (<><h2>הוסף הוצאה</h2>
        <form onSubmit={addOutcome}>
            <input name="date" type="text" placeholder='תאריך' />
            <input name="sum" type="number" placeholder=' סכום כולל' />
            <input name="description" type="text" placeholder='שם מוצר' />
            <input name="amount" type="number" placeholder='כמות' />
            <select name="paymentType" id="option" value={type} onChange={(e) => { setType(e.target.value) }} required="true" placeholder="אופן תשלום">
                <option value="מזומן">מזומן</option>
                <option value="העברה">העברה</option>
                <option value="צ'ק">צ'ק</option>
                <option value="אשראי">אשראי</option>
                <option value="אשראי דיירקט">אשראי דיירקט</option>
            </select>

            <button type='submit' onSubmit={addOutcome}>שליחה</button>
        </form></>
    )
}

export default Shopping



