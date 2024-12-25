const { getUser } = require('../../msc/functions');
const { EmbedBuilder } = require('discord.js');
const sym = '`';
// Assuming developers list is declared elsewhere, like in a config file
const developers = ['DEV ID'];

module.exports = {
    name: 'balance',
    aliases: ['money', 'cash'],
    async execute(client, message, args) {
        try {
            const userId = message.author.id;
            const user = message.author;

            // Handle mentioned users
            const mention = message.mentions.users.first();
            let targetData = await getUser(userId);
            let displayName = user.username;
            let avatarURL = user.displayAvatarURL({ dynamic: true });

            if (mention) {
                // Check if the user is a developer before proceeding
                if (!developers.includes(message.author.id)) {
                    return message.channel.send({ embeds: [SimpleEmbed('You do not have permission to mention users.')] });
                }

                targetData = await getUser(mention.id);
                if (!targetData) {
                    return message.channel.send({ embeds: [SimpleEmbed('User not found.')] });
                }

                displayName = mention.username;
                avatarURL = mention.displayAvatarURL({ dynamic: true });
            }

            const balance = targetData.balance || 0;  

            const embed = new EmbedBuilder()
                .setColor('#FFFF00')  
                .setTitle(`${displayName}'s Balance`)
                .setDescription(`**Balance**: ${sym}${balance}£${sym}`)
                .setThumbnail(avatarURL)
                .setFooter({ 
                    text: 'Requested by ' + message.author.username, 
                    iconURL: message.author.displayAvatarURL({ dynamic: true }) 
                })
                .setTimestamp();

            return message.channel.send({ embeds: [embed] });

        } catch (error) {
            console.error(error);
            return message.channel.send({ embeds: [SimpleEmbed('An error occurred while fetching the balance.')] });
        }
    }
};

// SimpleEmbed function for creating error message embeds
const SimpleEmbed = (message) => {
    return new EmbedBuilder().setDescription(message).setColor('#FF0000');
};
