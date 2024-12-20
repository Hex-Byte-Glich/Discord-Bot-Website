const { MessageEmbed } = require('discord.js');

// Example function to handle welcome message
function sendWelcomeMessage(guild, user) {
    const welcomeChannel = guild.channels.cache.get(guild.welcomeChannel);
    const welcomeMessage = guild.welcomeMessage || 'Welcome to the server, {user}!';
    
    // Creating the embed message
    const embed = new MessageEmbed()
        .setColor('#00FF00') // Customizable color
        .setTitle('Welcome!')
        .setDescription(welcomeMessage.replace('{user}', user.username)) // Replace placeholder with actual username
        .setFooter('Server Bot');

    // Send the embed to the welcome channel
    welcomeChannel.send({ embeds: [embed] });
}

// Example function to handle leave message
function sendLeaveMessage(guild, user) {
    const leaveChannel = guild.channels.cache.get(guild.leaveChannel);
    const leaveMessage = guild.leaveMessage || 'Goodbye, {user}. We will miss you!';

    // Creating the embed message
    const embed = new MessageEmbed()
        .setColor('#FF0000') // Customizable color
        .setTitle('Goodbye!')
        .setDescription(leaveMessage.replace('{user}', user.username)) // Replace placeholder with actual username
        .setFooter('Server Bot');

    // Send the embed to the leave channel
    leaveChannel.send({ embeds: [embed] });
}
