const { prefix } = require('../../data/config.json');
const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    name: 'kick',
    aliases: ['k'],
    description: 'Kick the user with a warning. [Administrator]',
    async execute(client, message, args) {
        try {
           
            if (!message.member.permissions.has(PermissionFlagsBits.KickMembers)) {
                return interaction.reply({ content: 'You do not have permission to kick members!', ephemeral: true });
              }

            const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
            if (!member) {
                return message.channel.send('Please mention a valid user to kick or provide their ID.');
            }

            if (!member.kickable) {
                return message.channel.send('I cannot kick this user. Make sure I have the necessary permissions.');
            }

            await member.kick();

            const kickEmbed = new EmbedBuilder()
                .setColor('#FFFF00') // Red color
                .setTitle('User Kicked')
                .setDescription(`${member.user.tag} has been kicked from the server.`)
                .addFields(
                    { name: 'Kicked by', value: message.author.tag },
                    { name: 'Reason', value: 'Violation of server rules' }
                )
                .setTimestamp();

            message.channel.send({ embeds: [kickEmbed] });
        } catch (error) {
            console.error('Error fetching user data:', error);
            await message.channel.send('An error occurred while executing the kick command. Please try again later.');
        }
    },
};
