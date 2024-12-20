const { prefix } = require('../../data/config.json')

module.exports = {
    name: 'help',
    aliases: ['h'],
    description: 'Commands Help',
    async execute(client, message, args) {
        try {
            // Get the user from the message
            const user = message.author;  

            // List of commands
            const commands = [
                { name: '!ping', description: 'Responds with "Pong!"' },
                { name: '!help', description: 'Displays this help message' },
                // Add more commands here as needed
            ];

            // Construct the help message
            const helpMessage = `**${user.username}'s Commands:**\n${commands.map(cmd => `- **${cmd.name}**: ${cmd.description}`).join('\n')}`;

            // Send the help message in response to the message
            await message.channel.send(helpMessage);
        } catch (error) {
            console.error('Error fetching user data:', error);
            await message.channel.send('An error occurred while fetching the help information. Please try again later.');
        }
    },
};