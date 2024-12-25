const { prefix } = require('../../data/config.json');
const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    name: 'unban',
    aliases: ['unb'],
    description: 'Unban the user from the guild. [Administrator]',
    async execute(client, message, args) {
        try {
            // Check if the user has permission to ban members
            if (!message.member.permissions.has(PermissionFlagsBits.BanMembers)) {
                return message.reply({ content: 'You do not have permission to unban members!', ephemeral: true });
            }

            // Extract userId from command arguments (expecting the user ID to be provided)
            const userId = args[0];
            if (!userId) {
                return message.reply('Please provide the user ID to unban.');
            }

            try {
                // Try fetching the banned user by ID
                const bannedUser = await message.guild.bans.fetch(userId);
                if (!bannedUser) {
                    return message.channel.send('No user found with that ID in the ban list.');
                }

                // Unban the user
                await message.guild.members.unban(userId);

                // Create the embed to notify about the unban
                const unbanEmbed = new EmbedBuilder()
                    .setColor('#FFFF00') // Yellow color for unban
                    .setTitle('User Unbanned')
                    .setDescription(`${bannedUser.user.tag} has been unbanned from the server.`)
                    .addFields(
                        { name: 'Unbanned by', value: message.author.tag },
                        { name: 'Reason', value: 'Unbanned by an admin' }
                    )
                    .setTimestamp();

                // Send the embed to the channel
                message.channel.send({ embeds: [unbanEmbed] });

            } catch (error) {
                console.error('Error fetching banned user:', error);
                message.channel.send('An error occurred while trying to unban the user.');
            }
        } catch (error) {
            console.error('Error executing unban command:', error);
            message.channel.send('An error occurred while executing the unban command. Please try again later.');
        }
    },
};
