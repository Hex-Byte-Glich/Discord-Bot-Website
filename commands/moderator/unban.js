const { prefix } = require('../../data/config.json');
const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    name: 'unban',
    aliases: ['unb'],
    description: 'unban the user from guild',
    async execute(client, message, args) {
        try {
           
            if (!message.member.permissions.has(PermissionFlagsBits.BanMembers)) {
                return interaction.reply({ content: 'You do not have permission to ban members!', ephemeral: true });
              }

            const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
            if (!member) {
                return message.channel.send('Please mention a valid user to ban or provide their ID.');
            }

            try {
                const bannedUser = await message.guild.bans.fetch(userId);
                if (!bannedUser) {
                    return message.channel.send('No user found with that ID in the ban list.');
                }

            await message.guild.members.unban(userId);

            const banEmbed = new EmbedBuilder()
                .setColor('#FFFF00') // Red color
                .setTitle('User Unbanned')
                .setDescription(`${bannedUser.user.tag} has been unbanned from the server.`)
                .addFields(
                    { name: 'unbanned by', value: message.author.tag },
                    { name: 'Reason', value: 'Unbanned by an admin' }
                )
                .setTimestamp();

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
