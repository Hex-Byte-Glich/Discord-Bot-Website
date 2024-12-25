const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'role',
    description: 'Shows all the roles and other info about the guild.',
    async execute(client, message, args) {
        try {
            // Get the guild (server) object
            const guild = message.guild;

            // Ensure the guild object is valid
            if (!guild) {
                return message.channel.send('Could not retrieve guild info.');
            }

            // Get all the roles in the guild (excluding @everyone)
            const allRoles = guild.roles.cache.filter(role => role.name !== '@everyone');

            // Filter out bot roles (roles that are assigned to bot members)
            const rolesWithoutBots = allRoles.filter(role => {
                // Check if any bot has this role
                return !guild.members.cache.some(member => member.user.bot && member.roles.cache.has(role.id));
            });

            // If no roles are available, inform the user
            if (rolesWithoutBots.size === 0) {
                return message.channel.send('There are no roles to display that are not assigned to bots.');
            }

            // Create an embed to display the roles
            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle(`Roles in ${guild.name}`)
                .setDescription('Here are the roles (excluding bot roles):')
                .addFields(
                    { name: 'Roles:', value: rolesWithoutBots.map(role => role.name).join('\n') || 'No roles found.' }
                )
                .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
                .setTimestamp();

            // Send the embed to the channel
            message.channel.send({ embeds: [embed] });
        } catch (error) {
            console.error('Error executing role command:', error);
            message.channel.send('Sorry, something went wrong while fetching the roles.');
        }
    }
};
