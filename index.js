const { Client, GatewayIntentBits } = require('discord.js');
require('dotenv').config();
const express = require('express');
const path = require('path');


const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages
    ]
});


client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

//running bot to online
client.login(process.env.TOKEN);

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
    
        // Retrieve the custom welcomeMessage for the guild, if it exists
        const settings = guildSettings[guildId];
        if (!settings || !settings.welcomeMessage) {
            return res.status(400).json({ message: 'No welcome message set for this guild' });
        }
    
        // Send the custom welcome message to the system channel
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
    
        // Example: Render the server settings page (can be extended to include settings)
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

    let guildSettings = {}; // Store guild settings in memory

    app.post('/update-settings', (req, res) => {
        const { prefix, welcomeMessage, guildId } = req.body;
    
        const guild = client.guilds.cache.get(guildId);
        if (!guild) {
            return res.status(404).send('Guild not found');
        }
    
        // Save the settings in memory (or save to a database)
        guildSettings[guildId] = {
            prefix: prefix || guildSettings[guildId]?.prefix,  // Default to previous if not provided
            welcomeMessage: welcomeMessage || guildSettings[guildId]?.welcomeMessage  // Default to previous if not provided
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