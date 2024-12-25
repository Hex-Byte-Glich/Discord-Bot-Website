const { EmbedBuilder } = require('discord.js');
const sym = '``';

module.exports = {
    name: 'member',
    description: 'Shows all the members and other info about the guild.',
    async execute(client, message, args) {
        try {
            // Get the guild (server) object
            const guild = message.guild;

            // Ensure the guild object is valid
            if (!guild) {
                return message.channel.send('Could not retrieve guild info.');
            }

            // Get all the members in the guild (excluding bots)
            const members = guild.members.cache.filter(member => !member.user.bot);

            // If no members are found, inform the user
            if (members.size === 0) {
                return message.channel.send('There are no members to display.');
            }

            // Create an embed to display the members
            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle(`Members in ${guild.name}`)
                .setDescription('Here are the members in the server (excluding bots):')
                .addFields(
                    { name: 'Members:', value: `${sym}${members.map(member => member.user.tag).join('\n')}${sym}` || 'No members found.' }
                )
                .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
                .setTimestamp();

            // Send the embed to the channel
            message.channel.send({ embeds: [embed] });
        } catch (error) {
            console.error('Error executing member command:', error);
            message.channel.send('Sorry, something went wrong while fetching the members.');
        }
    }
};
