try {
    const { PermissionsBitField } = require('discord.js');
    const mongoose = require('mongoose');
    const { userSchema } = require('../users/user');
    const User = mongoose.model('User', userSchema);

    const { getUser } = require('./functions');
    require('dotenv').config();
    const config = require('../data/config.json');
    const fs = require('fs');
    let banlist = [];
    let serverlist = [];
    const Owner = '';

    const AUTOMATION_THRESHOLD = 5;
    const TIME_WINDOW = 10000;
    let messageCache = {};

    const userFirstCommandTimes = new Map();
    const TIMES = 1 * 60 * 60 * 1000;

    function detectMessage(client) {

        const { 
            getCore,
            getSlashCommands,
            getModerator,
            getEnconomy
        } = require('./Message_Handle');

        client.on('messageCreate', async (message) => {

           // banlist = JSON.parse(fs.readFileSync('./banlist.json', 'utf8'));
           // serverlist = JSON.parse(fs.readFileSync('../Loto/banServerlist.json', 'utf8'));

            if (banlist.includes(message.author.id) || serverlist.includes(message.guildId) || message.content == 'ok') { return; }

            const guildPrefix = getGuildPrefix(message.guild.id);
            const messageContent = message.content;
            const lowerCaseMessageContent = messageContent.toLowerCase();

            if (!(lowerCaseMessageContent.startsWith(guildPrefix.toLowerCase()) || lowerCaseMessageContent.startsWith(config.prefix.toLowerCase())) || message.author.bot) { return; }

            const botMember = message.guild.members.me;

            if (!botMember.permissionsIn(message.channel).has(PermissionsBitField.Flags.SendMessages)) {
                return;
            } else if (!botMember.permissionsIn(message.channel).has(PermissionsBitField.Flags.ManageMessages)) {
                return;
            } else if (!botMember.permissionsIn(message.channel).has(PermissionsBitField.Flags.EmbedLinks)) {
                return;
            } else if (!botMember.permissionsIn(message.channel).has(PermissionsBitField.Flags.AttachFiles)) {
                return;
            } else if (!botMember.permissionsIn(message.channel).has(PermissionsBitField.Flags.AddReactions)) {
                return;
            } else if (!botMember.permissionsIn(message.channel).has(PermissionsBitField.Flags.ReadMessageHistory)) {
                return;
            }

            const userId = message.author.id;
            const content = message.content;

            if (!messageCache[userId]) {
                messageCache[userId] = [];
            }

            messageCache[userId].push({ content, timestamp: Date.now() });
            messageCache[userId] = messageCache[userId].filter(msg => msg.timestamp > Date.now() - TIME_WINDOW);

            const currentTime = new Date().getTime();
            if (!userFirstCommandTimes.has(userId)) {
                userFirstCommandTimes.set(userId, currentTime);
            }
            if (userFirstCommandTimes.has(userId)) {
                const collector = message.channel.createMessageCollector({
                    filter: (msg) => msg.author.id === message.author.id,
                    time: 300_000,
                    max: 1,
                });

                collector.on('end', (collected, reason) => {
                    if (reason === 'time') {
                        userFirstCommandTimes.delete(userId);
                    }
                });
            }

            // Define all developer IDs in an array
            const devIds = [
                process.env.DEVID,
            ];
            const actualPrefix = lowerCaseMessageContent.startsWith(guildPrefix.toLowerCase()) ? guildPrefix : config.prefix;

            const args = messageContent.slice(actualPrefix.length).trim().split(/ +/);
            let commandName = args.shift().toLowerCase();

            let userData = await getUser(message.author.id);
            if (!userData) {
                userData = new User({
                    userId: message.author.id,
                    balance: 50000
                });
                await userData.save();
            }
            if (!userData.username) { userData.username = `${message.author.username}`; };

            if (commandName == 'leaveserver') {

                const admin = getAdmin.get(commandName) || getAdmin.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
                if (!admin) return;

                // Checking for specific commands and developer access
                if (message.author.id === '1134766694506700821' && commandName === 'nextday') {
                    admin.execute(client, message, args);
                    return;
                }

                // Check if the author's ID is in the list of developer IDs
                if (devIds.includes(message.author.id)) {
                    admin.execute(client, message, args);
                    return;
                }

            } else if (commandName == 'help' || commandName == 'ping') {

                const Core = getCore.get(commandName) || getCore.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
                if (!Core) return;

                Core.execute(client, message, args);
                return;
            } else if (commandName == 'kick') {

                const Moderator = getModerator.get(commandName) || getModerator.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
                if (!Moderator) return;

                Moderator.execute(client, message, args);
                return;

            } else if (commandName == 'balance') {

                const Enconomy = getEnconomy.get(commandName) || getEnconomy.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
                if (!Enconomy) return;

                Enconomy.execute(client, message, args);
                return;
            
            }
        });

        client.on('interactionCreate', async (interaction) => {
            if (interaction.isCommand()) {
                const { commandName } = interaction;
                const command = getSlashCommands.get(commandName);

                if (!command) return;

                try {
                    await command.execute(interaction, client);
                } catch (error) {
                    console.error(`slach commands error : ${error}`);
                }
            }
        });
    }

    function getGuildPrefix(guildId) {
        return config.prefixes[guildId] || config.prefix;
    }

    module.exports = { detectMessage };

} catch (error) {
    console.log(`error detectMessage : ${error}`);
}