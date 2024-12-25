const mongoose = require('mongoose');
const { userSchema } = require('../../users/user');
const User = mongoose.model('User', userSchema);

let allUserIds = [];
let allUserIdsRank = [];

async function initializeUserIds() {
    try{
        const allUsers = await User.find({}, 'userId');
        allUserIds = allUsers.map(user => user.userId);

        allUsers.forEach(async user => {
            const userData = await User.findOne({ userId: user.userId });
           
        });

    }catch(error){
        console.error('Error initializing user IDs:', error);
    }
}

function getAllUserIds(){
    return allUserIds;
}

function getAllUserIdsRank(){
    return allUserIdsRank;
}

module.exports = { initializeUserIds, getAllUserIds, getAllUserIdsRank };