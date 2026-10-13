import React from 'react'
import { useState, useEffect } from 'react'
import axios from "axios"
import SingleIncome from './SingleIncome'
import SingleOutcome from './SingleOutcome'
import AddOutcome from './AddOutcome'
import Shopping from './Shopping'

const Outcomes = () => {
    const [addNew,setAddNew]=useState(false)
    const [addShopping,setAddShopping]=useState(false)
    

    const [info, setInfo] = useState([])
    const getData = async () => {
        try {
            const { data } = await axios.get(`http://127.0.0.1:7200/api/outcomes`)
            setInfo(data)
        } catch (error) {
            setErrTxt("err in conecting to the server please try again later")
        }


    }
    useEffect(() => { getData() }, [])
    return (<>
    
        <p>fgf</p>
        <button onClick={()=>{setAddShopping(!addShopping)}}>קניות</button>
        <button onClick={()=>{setAddNew(!addNew)}}>הוצאות אחרות</button>
        {info.map((o) => { return <SingleOutcome outcome={o} /> })}
        {console.log(info)}
        {/* <button onClick={()=>{setAddNew(!addNew)}}>דיווח</button> */}
        {addNew && <AddOutcome setAddNew={setAddNew}/>}
        {addShopping && <Shopping setAddShopping={setAddShopping}/>}



    </>
    )
}


export default Outcomes