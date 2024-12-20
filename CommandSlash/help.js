

module.exports = {
    name: 'help',
    aliases: ['h'],
    description: 'Commands Help',
    execute: async (interaction) => {
        try {
            // Get the user from the interaction
            const user = interaction.user;  

            // List of commands
            const commands = [
                { name: '!ping', description: 'Responds with "Pong!"' },
                { name: '!help', description: 'Displays this help message' },
                // Add more commands here as needed
            ];

            // Construct the help message
            const helpMessage = `**${user.username}'s Commands:**\n${commands.map(cmd => `- **${cmd.name}**: ${cmd.description}`).join('\n')}`;

            // Send the help message in response to the interaction
            await interaction.reply(helpMessage);
        } catch (error) {
            console.error('Error fetching user data:', error);
            await interaction.reply('An error occurred while fetching the help information. Please try again later.');
        }
    },
};