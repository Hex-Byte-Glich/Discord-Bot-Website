const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    name: 'unbans',
    aliases: ['unbs'],
    description: 'Unban users in the guild. [Administrator]',
    async execute(client, message, args) {
        try {
            
            if (!message.member.permissions.has(PermissionFlagsBits.BanMembers)) {
                return message.reply({ content: 'You do not have permission to unban members!', ephemeral: true });
            }

            
            const userId = args[0];
            if (!userId) {
                return message.reply('Please provide the ID of the user you want to unban.');
            }

            
            const unbannedUser = await message.guild.members.unban(userId);

           
            const unbanEmbed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('User Unbanned')
                .setDescription(`${unbannedUser.tag} has been unbanned.`)
                .setTimestamp();

            
            message.channel.send({ embeds: [unbanEmbed] });
        } catch (error) {
            console.error('Error fetching user data:', error);
            await message.channel.send('An error occurred while trying to unban the user. Please try again later.');
        }
    },
};
