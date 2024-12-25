const { EmbedBuilder } = require('discord.js');
const sym = '`';

module.exports = {
    name: 'serverinfo',
    description: 'Shows all the roles and other info about the guild.',
    async execute(client, message, args) {
        try {
            // Get the guild (server) object
            const guild = message.guild;

            // Ensure the guild object is valid
            if (!guild) {
                return message.channel.send('Could not retrieve guild info.');
            }

            // Get the necessary details with fallback for undefined values
            const name = guild.name || `${sym}Unknown Server${sym}`;
            const guild_id = guild.id || `${sym}Unknown ID${sym}`;
            const memberCount = guild.memberCount || 0;
            const roles = guild.roles.cache;
            const ownerId = guild.ownerId;
            const createdAt = guild.createdAt ? guild.createdAt.toDateString() : `${sym}Unknown${sym}`;
            const region = guild.region || `${sym}Unknown${sym}`;
            const iconURL = guild.iconURL() || ''; // Ensure it's not undefined
            const rolesList = roles.size > 0 ? roles.map(role => role.name).join(', ') : 'No roles available';
            const owner = await guild.members.fetch(ownerId).catch(() => null);
            const ownerTag = owner ? owner.user.tag : `${sym}Unknown Owner${sym}`;

            // Create an embed message with the gathered info
            const embed = new EmbedBuilder()
                .setColor('#FFC0CB')
                .setTitle(`${sym}${name}${sym}`)
                .setThumbnail(iconURL)
                .addFields(
                    { name: '𝙎𝙚𝙧𝙫𝙚𝙧 𝙄𝘿', value: `${sym}${guild_id}${sym}`, inline: true },
                    { name: '𝙎𝙚𝙧𝙫𝙚𝙧 𝙉𝙖𝙢𝙚', value: `${sym}${name}${sym}`, inline: true },
                    { name: '𝙎𝙚𝙧𝙫𝙚𝙧 𝙊𝙬𝙣𝙚𝙧', value: `${sym}${ownerTag}${sym}`, inline: true },
                    { name: '𝘾𝙧𝙚𝙖𝙩𝙚𝙙 𝘼𝙩', value: `${sym}${createdAt}${sym}`, inline: true },
                    { name: '𝙎𝙚𝙧𝙫𝙚𝙧 𝙍𝙚𝙜𝙞𝙤𝙣', value: `${sym}${region}${sym}`, inline: true },
                    { name: `𝙏𝙤𝙩𝙖𝙡 𝙈𝙚𝙢𝙗𝙚𝙧𝙨 (${memberCount.toString()})`, value: `!member`, inline: true },
                    { name: `𝙏𝙤𝙩𝙖𝙡 𝙍𝙤𝙡𝙚𝙨 (${roles.size.toString()})`, value: `!role`, inline: true }
                    
                )
                .setTimestamp();

            // Send the embed to the channel
            message.channel.send({ embeds: [embed] });
        } catch (error) {
            console.error('Error executing serverinfo command:', error);
            message.channel.send('Sorry, something went wrong while fetching the server info.');
        }
    }
};
