const { Client, IntentsBitField, Collection, ActivityType, EmbedBuilder } = require('discord.js');
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

const twitchStreamUrl = 'https://www.twitch.tv/loadingbotfun';

client.on('ready', async () => {
    console.log(`${client.user.tag} is online!`);

    // Function to set presence with dynamic server and member counts
    async function updatePresence() {
        const totalServers = client.guilds.cache.size;
        const totalMembers = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);


        const statuses = [
            { status: 'dnd', activity: { type: ActivityType.Streaming, name: `${totalServers} Server!`, url: twitchStreamUrl } },
        ];

        // Select a random status from the list
        const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
        
        client.user.setPresence({
            status: randomStatus.status,
            activities: [randomStatus.activity]
        });
    }

    // Update presence on startup
    await updatePresence();

    // Update presence every 10 minutes
    setInterval(updatePresence, 10 * 60 * 1000);

    // Call detectMessage after the client is ready
    if (typeof detectMessage === 'function') {
        detectMessage(client);
    } else {
        console.error('detectMessage is not a function');
    }

    //start auto drop cash
    
});

//running bot to online
client.login(process.env.TOKEN_BOT);

client.commands = new Collection();

const commandFolderPath = path.join(__dirname, './CommandSlash');

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

        const rest = new REST({ version: '10' }).setToken(process.env.TOKEN_BOT);
        
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

//dashboard to run website
const app = express();
app.use(express.static(path.join(__dirname, 'CSS')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'html'));
app.use(express.urlencoded({ extended: true }));

//run working dashboard
client.once('ready', () => {
    //console.log(`Logged in as ${client.user.tag}`);

    const botCategories = [
        {
            name: "General Commands",
            commands: [
                { name: "!help", description: "Displays a list of available commands" },
                { name: "!ping", description: "Ping the bot to check latency" },
                { name: "!info", description: "Shows information about the bot" }
            ]
        },
        {
            name: "Moderation Commands",
            commands: [
                { name: "!ban", description: "Bans a user from the server" },
                { name: "!kick", description: "Kicks a user from the server" }
            ]
        }
    ];

    // Define the root route
    app.get('/', (req, res) => {
        const guilds = client.guilds.cache.map(guild => ({
            name: guild.name,
            id: guild.id,
            memberCount: guild.memberCount,
            prefix: guild.prefix,
            moderatorRole: "Admin",
            moderatorPermissions: ["ban", "kick"],
            welcomeChannel: '#welcome',
            leaveChannel: "#goodbye"
        }));

        guilds.moderatorPermissions = guilds.moderatorPermissions || [];

        res.render('index', { clientUserTag: client.user.tag, guilds: guilds, botCategories });
    });


    // Handle the send message route
    app.get('/send-message/:guildId', (req, res) => {
        const guildId = req.params.guildId;
        const guild = client.guilds.cache.get(guildId);
        
        if (!guild) {
            return res.status(404).json({ message: 'Guild not found' });
        }
    
        // Retrieve the guild settings
        const settings = guildSettings[guildId];
        if (!settings || !settings.welcomeMessage) {
            return res.status(400).json({ message: 'No welcome message set for this guild' });
        }
    
        // Get the system channel or fallback to a custom channel
        const channel = guild.systemChannel || guild.channels.cache.get(settings.welcomeChannel);
    
        if (!channel) {
            return res.status(400).json({ message: 'No valid channel found to send the welcome message' });
        }
    
        // Try sending the message to the selected channel
        channel.send(settings.welcomeMessage)
            .then(() => res.json({ message: 'Message sent successfully!' }))
            .catch(err => {
                console.error(err);
                res.status(500).json({ message: 'Error sending message', error: err });
            });
    });
    

    app.post('/manage-server', (req, res) => {
        const guildId = req.body.guildId;
        const guild = client.guilds.cache.get(guildId);
        if (!guild) {
            return res.status(404).send('Server not found');
        }
    
        const currentSettings = guildSettings[guildId] || {};

    // Render the EJS template and pass the guild data
    res.render('manage-server', {
        guild: guild,
        welcomeChannel: currentSettings.welcomeChannel,
        leaveChannel: currentSettings.leaveChannel,
        welcomeMessage: currentSettings.welcomeMessage,
        leaveMessage: currentSettings.leaveMessage
    });
       
        
    });
    

app.get('/manage-server/:guildId', async (req, res) => {
    const guildId = req.params.guildId;
    const guild = client.guilds.cache.get(guildId);
    if (!guild) {
        return res.status(404).send('Guild not found');
    }

   // console.log(channels);  // Debugging line

    // Render the page with the guild details and channels
    res.render('manage-server', {
        guild: guild
    });
});




    let guildSettings = {}; 

    app.post('/update-settings', (req, res) => {
        const { prefix, welcomeMessage, welcomeChannel, leaveChannel, guildId } = req.body;
        
        // Check if all required fields are present
        if (!guildId) {
            return res.status(400).send('Guild ID is required.');
        }
        
        // Fetch the guild by ID
        const guild = client.guilds.cache.get(guildId);
        if (!guild) {
            return res.status(404).send('Guild not found');
        }
    
        // Validate if the provided channels exist in the guild
        if (welcomeChannel && !guild.channels.cache.has(welcomeChannel)) {
            return res.status(400).send('Invalid welcome channel ID.');
        }
        if (leaveChannel && !guild.channels.cache.has(leaveChannel)) {
            return res.status(400).send('Invalid leave channel ID.');
        }
        
        // Save the settings in memory (or to a database)
        guildSettings[guildId] = {
            prefix: prefix || guildSettings[guildId]?.prefix,  // Default to current setting if not provided
            welcomeMessage: welcomeMessage || guildSettings[guildId]?.welcomeMessage,
            welcomeChannel: welcomeChannel || guildSettings[guildId]?.welcomeChannel,
            leaveChannel: leaveChannel || guildSettings[guildId]?.leaveChannel,
        };
        
        console.log(`Updated settings for guild: ${guild.name}`);
        console.log(`Prefix: ${prefix || 'No change'}`);
        console.log(`Welcome Message: ${welcomeMessage || 'No change'}`);
        console.log(`Welcome Channel: ${welcomeChannel || 'No change'}`);
        console.log(`Leave Channel: ${leaveChannel || 'No change'}`);
        
        // Redirect to the manage-server page with the updated settings
        res.redirect(`/manage-server/${guildId}`);
    });

    let guildSettingsd = {}; // To store guild settings in memory
    app.post('/set-welcome-leave', (req, res) => {
        const { welcomeChannel, leaveChannel, guildId, welcomeMessage, leaveMessage } = req.body;
        
        // Check if all required fields are present
        if (!guildId) {
            return res.status(400).send('Guild ID is required.');
        }
        
        // Fetch the guild by ID
        const guild = client.guilds.cache.get(guildId);
        if (!guild) {
            return res.status(404).send('Guild not found');
        }
    
        // Validate if the provided channels exist in the guild
        if (welcomeChannel && !guild.channels.cache.has(welcomeChannel)) {
            return res.status(400).send('Invalid welcome channel ID.');
        }
        if (leaveChannel && !guild.channels.cache.has(leaveChannel)) {
            return res.status(400).send('Invalid leave channel ID.');
        }
        
        // Save the settings in memory (or to a database)
        guildSettingsd[guildId] = {
            welcomeChannel: welcomeChannel || guildSettings[guildId]?.welcomeChannel,
            leaveChannel: leaveChannel || guildSettings[guildId]?.leaveChannel,
            welcomeMessage: welcomeMessage || guildSettings[guildId]?.welcomeMessage || 'Welcome {user} to the server!',
            leaveMessage: leaveMessage || guildSettings[guildId]?.leaveMessage || 'Goodbye {user}, we will miss you!',
        };
    
        console.log(`Welcome Channel: ${welcomeChannel || 'No change'}`);
        console.log(`Leave Channel: ${leaveChannel || 'No change'}`);
        console.log(`Welcome Message: ${welcomeMessage || 'No change'}`);
        console.log(`Leave Message: ${leaveMessage || 'No change'}`);
        
        // Redirect to the manage-server page with the updated settings
        res.redirect(`/manage-server/${guildId}`);
    });
    
    client.on('guildMemberAdd', member => {

        if (member.user.bot) {
            return;
        }
        
        const guildId = member.guild.id;
        const settings = guildSettingsd[guildId];  // Assuming guildSettingsd contains the settings
    
        if (settings && settings.welcomeChannel) {
            const channel = member.guild.channels.cache.get(settings.welcomeChannel);
    
            if (channel) {
                // Create the welcome embed
                const welcomeEmbed = new EmbedBuilder()
                    .setColor('#00FF00') // Set the embed color (green)
                    .setTitle('Welcome to the Server!')
                    .setDescription(`Welcome **${member.user.username}**! We're happy to have you here.`)
                    .setFooter({ text: 'Enjoy your stay!' })
                    .setTimestamp();
    
                // If there's a custom welcome message, add it to the embed
              //  if (settings.welcomeMessage) {
             //       welcomeEmbed.addFields({ name: 'Message', value: settings.welcomeMessage.replace('{user}', member.user.username) });
              //  }
    
                // Send the embed
                channel.send({ embeds: [welcomeEmbed] });
            }
        }
    });
    
    // Handle member leaving the server
    client.on('guildMemberRemove', member => {
        const guildId = member.guild.id;
        const settings = guildSettingsd[guildId];
    
        if (settings && settings.leaveChannel) {
            const channel = member.guild.channels.cache.get(settings.leaveChannel);
    
            if (channel) {
                // Create the leave embed
                const leaveEmbed = new EmbedBuilder()
                    .setColor('#FF0000') // Set the embed color (red)
                    .setTitle('Goodbye!')
                    .setDescription(`Goodbye **${member.user.username}**. We're sorry to see you go.`)
                    .setFooter({ text: 'We hope to see you again!' })
                    .setTimestamp();
    
                // If there's a custom leave message, add it to the embed
               // if (settings.leaveMessage) {
                 //   leaveEmbed.addFields({ name: 'Message', value: settings.leaveMessage.replace('{user}', member.user.username) });
               // }
    
                // Send the embed
                channel.send({ embeds: [leaveEmbed] });
            }
        }
    });
    

    // Start the server after the bot is ready
    app.listen(3000, () => {
        console.log('Web server is running on http://localhost:3000');
    });
});

