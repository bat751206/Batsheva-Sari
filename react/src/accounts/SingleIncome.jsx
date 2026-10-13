import React from 'react'

const SingleIncome = ({ income }) => {
    console.log(income);
    
    return (
        <>
        <p></p>
            <span>{income.date}</span>
            <span>{income.sum}</span>
            <span>{income.paymentType}</span>
            <span>{income.renter}</span>

        </>
    )
}

export default SingleIncome