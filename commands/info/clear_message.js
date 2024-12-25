const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'clear',
    description: 'Clear messages in the current channel.',
    async execute(client, message, args) {
        // Define developer and owner permissions
        const developerIDs = ['1134766694506700821']; // Add developer IDs here

        // Check if the user is the owner or a developer
        if (message.author.id !== message.guild.ownerId && !developerIDs.includes(message.author.id)) {
            return message.reply({ embeds: [SimpleEmbed("You do not have permission to use this command.", '#FF0000')] });
        }

        // Check if the number of messages to delete is specified
        const messageCount = parseInt(args[0], 10);

        if (isNaN(messageCount) || messageCount <= 0) {
            return message.reply({ embeds: [SimpleEmbed("Please specify a valid number of messages to delete.", '#FF0000')] });
        }

        try {
            // Fetch the messages from the channel
            const fetchedMessages = await message.channel.messages.fetch({ limit: messageCount });

            // Filter out pinned messages
            const deletableMessages = fetchedMessages.filter(msg => !msg.pinned);

            // Perform bulk delete
            await message.channel.bulkDelete(deletableMessages);

            // Send a confirmation message
            const deleteMessage = await message.channel.send({ embeds: [SimpleEmbed(`Cleared ${deletableMessages.size} messages from this channel.`, '#00FF00')] });

            // Timeout to delete the confirmation message after 5 seconds
            setTimeout(async () => {
                try {
                    await deleteMessage.delete();
                } catch (error) {
                    console.error("Failed to delete the confirmation message:", error);
                }
            }, 5000);

        } catch (error) {
            console.error(error);
            // Send error message with embed
            message.reply({ embeds: [SimpleEmbed("There was an error trying to clear messages in this channel.", '#FF0000')] });
        }
    }
};

// Utility function to create simple embeds
const SimpleEmbed = (message, color = '#FFFF00') => {
    return new EmbedBuilder()
        .setDescription(message)
        .setColor(color)
        .setTimestamp();  // Optional: Adds timestamp for context
};
