const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    name: String,
    email: String,
    passwordHash: String,
    phone: String,
    language: { type: String, default: "English" },
    pic: {
        type: String,
        default: "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
    },
    reset_OTP: String,
    loans: {
        personalLoan: { type: Array, default: [] },
        creditCardLoan: { type: Array, default: [] },
        businessLoan: { type: Array, default: [] },
    }
});

const Loanuser = mongoose.model('LoanUser', userSchema);
module.exports = Loanuser;
