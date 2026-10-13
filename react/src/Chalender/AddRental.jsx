import React from 'react'

const AddRental = ({ setShowAddRental, selectedDate }) => {

    return (
        <form className="add-rental-form">
            <h2>הוסף השכרה</h2>
            <input name="date" type="text" placeholder='תאריך' value={selectedDate} readOnly />
            <input name="numOfBeds" type="number" placeholder='מספר מיטות' />
            <input name="numOfBabyBeds" type="number" placeholder='מספר מיטות תינוק' />
            <input name="numOfNights" type="number" placeholder='מספר לילות' />
            <input name="checkPikadon" type="checkbox" placeholder='צ׳ק פיקדון' />
            <input name="tivuch" type="checkbox" placeholder='תיווך' />
            <input name="sum" type="number" placeholder='סכום' />
            <input name="description" type="text" placeholder='תיאור' />
            <input name="tenantName" type="text" placeholder='שם שוכר' />

            <button type='submit'>שליחה</button>
        </form>
    )
}

export default AddRental