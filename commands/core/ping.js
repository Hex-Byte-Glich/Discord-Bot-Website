const { EmbedBuilder } = require('discord.js');
const sym = '`';
const mongoose = require('mongoose');

module.exports = {
    name: 'ping',
    description: 'Ping the bot to check latency, including Mongoose (MongoDB) latency',
    async execute(client, message, args) {
        try {
            const userId = message.author.id;
            const user = message.author;

            // Send a message to get the current timestamp
            const sentMessage = await message.reply('Pinging...');

            // Measure the time difference to calculate bot latency
            const latency = sentMessage.createdTimestamp - message.createdTimestamp;
            const apiLatency = Math.round(client.ws.ping);  // WebSocket API ping

            // Measure Mongoose latency
            const mongooseStart = Date.now();
            await mongoose.connection.db.command({ ping: 1 });
            const mongooseLatency = Date.now() - mongooseStart;

            // Create an embed for the response
            const embed = new EmbedBuilder()
                .setColor('#FFFF00')
                .setTitle('Pong!')
                .setDescription(`Latency is ${sym}${latency}${sym}ms.\nAPI Latency is ${sym}${apiLatency}${sym}ms.\nMongoose Latency is ${sym}${mongooseLatency}${sym}ms.`)
                .setFooter({ text: 'Bot Latency' })
                .setTimestamp(); // Optionally add a timestamp

            // Edit the message to include the embed
            await sentMessage.edit({
                content: '', // Empty content to remove the initial message
                embeds: [embed], // Attach the embed
            });
        } catch (error) {
            console.error('Error executing ping command:', error);
            await message.reply('There was an error while trying to ping the bot.');
        }
    }
};
