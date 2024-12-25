const { prefix } = require('../../data/config.json');
const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    name: 'ban',
    aliases: ['b'],
    description: 'ban the user out from guild',
    async execute(client, message, args) {
        try {
           
            if (!message.member.permissions.has(PermissionFlagsBits.BanMembers)) {
                return interaction.reply({ content: 'You do not have permission to ban members!', ephemeral: true });
              }

            const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
            if (!member) {
                return message.channel.send('Please mention a valid user to ban or provide their ID.');
            }

            if (!member.bannable) {
                return message.channel.send('I cannot ban this user. Make sure I have the necessary permissions.');
            }

            await member.ban();

            const banEmbed = new EmbedBuilder()
                .setColor('#FFFF00') // Red color
                .setTitle('User Banned')
                .setDescription(`${member.user.tag} has been kicked from the server.`)
                .addFields(
                    { name: 'Ban by', value: message.author.tag },
                    { name: 'Reason', value: 'Violation of server rules' }
                )
                .setTimestamp();

            message.channel.send({ embeds: [banEmbed] });
        } catch (error) {
            console.error('Error fetching user data:', error);
            await message.channel.send('An error occurred while executing the ban command. Please try again later.');
        }
    },
};
