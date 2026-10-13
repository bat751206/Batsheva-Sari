import React from 'react'

const SingleOutcome = ({outcome}) => {
    return (<>
        <span>{outcome.date}</span>
        <span>{outcome.sum}</span>
        <span>{outcome.paymentType}</span>
        <span>{outcome.description}</span>



    </>
    )
}

export default SingleOutcome