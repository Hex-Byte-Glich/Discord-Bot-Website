const fs = require('fs');
const { getFiles } = require('./getFile');

const slashCommands = fs.readdirSync('./CommandSlash').filter(file => file.endsWith('.js'));
const getSlashCommands = getFiles(slashCommands, '../CommandSlash');

//sending file
const coreFile = fs.readdirSync('./commands/core').filter(file => file.endsWith('.js'));
const moderatorFile = fs.readdirSync('./commands/moderator').filter(file => file.endsWith('.js'));
const enconomyFile = fs.readdirSync('./commands/enconomy').filter(file => file.endsWith('.js'));

//getfile
const getCore = getFiles(coreFile, '../commands/core');
const getModerator = getFiles(moderatorFile, '../commands/moderator');
const getEnconomy = getFiles(enconomyFile, '../commands/enconomy');

module.exports = { 
    getCore,
    getSlashCommands,
    getModerator,
    getEnconomy

};