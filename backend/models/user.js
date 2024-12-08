const mongoose = require('mongoose');

// Define the schema for the user
const userSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true  // Ensure email is unique
    },
    dob: {
        type: Date,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        required: true
    }
});

// Create the User model
const User = mongoose.model('User', userSchema);

module.exports = User;
