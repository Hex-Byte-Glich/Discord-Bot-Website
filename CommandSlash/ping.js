const { prefix } = require('../data/config.json');
const fs = require('fs');
const path = require('path');
const { EmbedBuilder } = require('discord.js');
const sym = '`';

module.exports = {
    name: 'ping',
    description: 'Ping the bot to check latency',
    execute: async (interaction) => {
        try {
            // Send a message to get the current timestamp
                        const sentMessage = await interaction.reply('Pinging...');
            
                        // Measure the time difference to calculate latency
                        const latency = sentMessage.createdTimestamp - interaction.createdTimestamp;
                        const apiLatency = Math.round(interaction.ws.ping);  // WebSocket API ping
            
                        // Create an embed for the response
                        const embed = new EmbedBuilder()
                            .setColor('#FFFF00')
                            .setTitle('Pong!')
                            .setDescription(`Latency is ${sym}${latency}${sym}ms.\nAPI Latency is ${sym}${apiLatency}${sym}ms.`)
                            .setFooter({ text: 'Bot Latency' })
                            .setTimestamp(); // Optionally add a timestamp
            
                        // Edit the message to include the embed
                        await sentMessage.edit({
                            content: '', // Empty content to remove the initial message
                            embeds: [embed], // Attach the embed
                        });
        } catch (error) {
            console.error('Error fetching user data:', error);
            await interaction.reply('An error occurred while fetching the help information. Please try again later.');
        }
    },
};