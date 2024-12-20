const fs = require('fs');
const { getFiles } = require('./getFile');

const slashCommands = fs.readdirSync('./CommandSlash').filter(file => file.endsWith('.js'));
const getSlashCommands = getFiles(slashCommands, '../CommandSlash');

//sending file
const coreFile = fs.readdirSync('./commands/core').filter(file => file.endsWith('.js'));

//getfile
const getCore = getFiles(coreFile, '../commands/core');

module.exports = { 
    getCore,
    getSlashCommands 
};