const mongoose = require('mongoose')

const rentsSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true
    },
    numOfBeds: {
        type: Number,
        required: true
    },
    numOfBabyBeds: {
        type: Number,
        default: 0
    },
    numOfNights: {
        type: Number,
        required: true
    },
    todoListActivated: {
        type: Boolean,
        default: false
    },
    // שומר את התאריך שבו נשלחה תזכורת הצהריים כדי למנוע שליחה חוזרת.
    todoReminderSentDate: {
        // שומר תאריך בפורמט טקסט אחיד, למשל YYYY-MM-DD.
        type: String,
        // ערך ריק מציין שעדיין לא נשלחה תזכורת.
        default: ''
    },
    renter: {
        type: mongoose.ObjectId,
        ref: 'Renter'
    },
    checkPikadon: {
        type: Boolean,
        default: false
    },
    tivuch: {
        type: Boolean,
        default: false
    },
    sumPayment: {
        type: Number,
        required: true
    },
    isPaid: {
        type: Boolean,
        default: false
    },
    advance: {
        type: Number,
        default: function () {
            return Number(this.sumPayment || 0) * 0.1
        },
        required: true
    },
    paidAdvance: {
        type: Boolean,
        default: false
    },

    paymentType: {
        type: String,
        enum: ['מזומן', 'העברה', "צ'ק"]
    },
    advancePaymentType: {
        type: String,
        enum: ['מזומן', 'העברה', "צ'ק"],
        required:true
    },
    description: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
})

module.exports = mongoose.model('Rent', rentsSchema)