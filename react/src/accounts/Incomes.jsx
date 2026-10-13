import React from 'react'
import { useState,useEffect } from "react"
import axios from "axios"
import SingleIncome from './SingleIncome'



const Incomes = () => {
    const [info, setInfo] = useState([])
    const getData = async () => {
        try {
            const { data } = await axios.get(`http://127.0.0.1:7200/api/incomes`)
            setInfo(data)
        } catch (error) {
            setErrTxt("err in conecting to the server please try again later")
        }
        

    }
    useEffect(() => { getData() }, [])
    return (<>
    
        {info.map((i) => { return <SingleIncome income={i} /> })}
        {console.log(info)}




    </>
    )
}

export default Incomes