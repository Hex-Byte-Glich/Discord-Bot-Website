const fs = require('fs');
const { getFiles } = require('./getFile');

const slashCommands = fs.readdirSync('./CommandSlash').filter(file => file.endsWith('.js'));
const getSlashCommands = getFiles(slashCommands, '../CommandSlash');

//folder admin
const adminFile = fs.readdirSync('./commands/admin').filter(file => file.endsWith('.js'));
const getAdmin = getFiles(adminFile, '../commands/admin');

//sending file
const coreFile = fs.readdirSync('./commands/core').filter(file => file.endsWith('.js'));
const moderatorFile = fs.readdirSync('./commands/moderator').filter(file => file.endsWith('.js'));
const enconomyFile = fs.readdirSync('./commands/enconomy').filter(file => file.endsWith('.js'));
const infoFile = fs.readdirSync('./commands/info').filter(file => file.endsWith('.js'));

//getfile
const getCore = getFiles(coreFile, '../commands/core');
const getModerator = getFiles(moderatorFile, '../commands/moderator');
const getEnconomy = getFiles(enconomyFile, '../commands/enconomy');
const getInfo = getFiles(infoFile, '../commands/info');

module.exports = { 
    getCore,
    getSlashCommands,
    getModerator,
    getEnconomy,
    getAdmin,
    getInfo

};