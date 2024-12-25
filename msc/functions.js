const mongoose = require('mongoose');
const { userSchema } = require('../users/user');
const User = mongoose.model('User', userSchema);

async function getUser(id) {
    let userData = await User.findOne({ userId: id });
    return userData;
}

module.exports = {
    getUser
};