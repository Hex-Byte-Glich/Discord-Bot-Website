const { Client, IntentsBitField, Collection } = require('discord.js');
require('dotenv').config();
const express = require('express');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { prefix } = require('./data/config.json');
const { detectMessage } = require('./msc/Message');

const path = require('path');
const chalk = require('chalk');
const fs = require('fs');

const { ClusterClient } = require('discord-hybrid-sharding');

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.MessageContent,
        IntentsBitField.Flags.DirectMessages,
        IntentsBitField.Flags.GuildVoiceStates,
        IntentsBitField.Flags.GuildMessageReactions
    ],
    shards: [0],
    shardCount: 1
});

client.cluster = new ClusterClient(client);

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

//running bot to online
client.login(process.env.TOKEN);

client.commands = new Collection();

const commandFolderPath = path.join(__dirname, 'CommandSlash');

// Dynamically load command files from the slashCommands folder
fs.readdirSync(commandFolderPath).forEach(file => {
    if (file.endsWith('.js')) {
        const command = require(path.join(commandFolderPath, file));

        // Check if the command has a valid name (between 1 ansd 32 characters)
        if (command.name && command.name.length >= 1 && command.name.length <= 32) {
            client.commands.set(command.name, command);
        } else {
            console.error(chalk.red.bold(`Invalid command name in file ${file}: `) + 'Name must be between 1 and 32 characters.');
        }
    }
});

(async () => {
    try {
        console.log('Started refreshing application (/) commands.');

        const commands = Array.from(client.commands.values()).map(command => ({
            name: command.name,
            description: command.description,
            options: command.options || [],
        }));

        // Log the commands for debugging
        // console.log('Commands to be registered:', commands);     

        const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
        
        // Register commands for a specific guild
        await rest.put(
            Routes.applicationCommands(process.env.APPLIACTION_ID), // Register globally
            { body: commands },
        );

        console.log('Successfully reloaded application (/) commands for the guild.');
    } catch (error) {
        console.error(chalk.red.bold('ERROR: ') + 'Failed to refresh application commands:', error);
    }
})();

client.on('ready', async () => {

   // console.log(`Logged in as ${client.user.tag}!`);
    console.log(`BOT PREFIX: ${prefix}`)
    
    if (typeof detectMessage === 'function') {
        detectMessage(client);
    } else {
        console.error('detectMessage is not a function');
    }
    
});

//dashboard to run website
const app = express();
app.use(express.static(path.join(__dirname, 'CSS')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'html'));
app.use(express.urlencoded({ extended: true }));

//run working dashboard
client.once('ready', () => {
    //console.log(`Logged in as ${client.user.tag}`);

    // Define the root route
    app.get('/', (req, res) => {
        const guilds = client.guilds.cache.map(guild => ({
            name: guild.name,
            id: guild.id,
            memberCount: guild.memberCount
        }));

        
        res.render('index', { clientUserTag: client.user.tag, guilds: guilds });
    });


    // Handle the send message route
    app.get('/send-message/:guildId', (req, res) => {
        const guildId = req.params.guildId;
        const guild = client.guilds.cache.get(guildId);
        if (!guild) {
            return res.status(404).json({ message: 'Guild not found' });
        }
    
       
        const settings = guildSettings[guildId];
        if (!settings || !settings.welcomeMessage) {
            return res.status(400).json({ message: 'No welcome message set for this guild' });
        }
    
        
        guild.systemChannel.send(settings.welcomeMessage)
            .then(() => res.json({ message: 'Message sent successfully!' }))
            .catch(err => res.status(500).json({ message: 'Error sending message', error: err }));
    });

    app.post('/manage-server', (req, res) => {
        const guildId = req.body.guildId;
        const guild = client.guilds.cache.get(guildId);
        if (!guild) {
            return res.status(404).send('Server not found');
        }
    
       
        res.render('manage-server', { guild });
    });

    app.get('/manage-server/:guildId', (req, res) => {
        const guildId = req.params.guildId;
        const guild = client.guilds.cache.get(guildId);
    
        if (!guild) {
            return res.status(404).send('Guild not found');
        }
    
        res.render('manage-server', { guild });
    });

    let guildSettings = {}; 

    app.post('/update-settings', (req, res) => {
        const { prefix, welcomeMessage, guildId } = req.body;
    
        const guild = client.guilds.cache.get(guildId);
        if (!guild) {
            return res.status(404).send('Guild not found');
        }
    
        // Save the settings in memory (or save to a database)
        guildSettings[guildId] = {
            prefix: prefix || guildSettings[guildId]?.prefix,
            welcomeMessage: welcomeMessage || guildSettings[guildId]?.welcomeMessage
        };
    
        console.log(`Updated settings for guild: ${guild.name}`);
        console.log(`Prefix: ${prefix}`);
        console.log(`Welcome Message: ${welcomeMessage}`);
    
        res.redirect(`/manage-server/${guildId}`);
    });

    // Start the server after the bot is ready
    app.listen(3000, () => {
        console.log('Web server is running on http://localhost:3000');
    });
});