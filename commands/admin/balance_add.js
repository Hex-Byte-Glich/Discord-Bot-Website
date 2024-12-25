const { getUser } = require('../../msc/functions');
const { EmbedBuilder } = require('discord.js');
const sym = '`';

module.exports = {
    name: 'add',
    description: 'add somethings in bot. [admin]',
    async execute(client, message, args) {
        const user = message.author;

        
        const parseAmount = (arg) => {
            const regex = /^(\d+)([KkMmBbTt])?$/;
            const match = arg.match(regex);
            if (!match) return NaN;

            const amount = parseInt(match[1]);
            switch (match[2]?.toUpperCase()) {
                case 'K':
                    return amount * 1_000;         // Thousand
                case 'M':
                    return amount * 1_000_000;     // Million
                case 'B':
                    return amount * 1_000_000_000; // Billion
                case 'T':
                    return amount * 1_000_000_000_000; // Trillion
                default:
                    return amount; // No suffix, return the amount directly
            }
        };

        const amount = parseAmount(args[0]);
        if (isNaN(amount) || amount <= 0) {
            return message.reply({ embeds: [SimpleEmbed("**Please provide a valid amount to add.**")] });
        }

       
        const userData = await getUser(user.id);

        
        const mention = message.mentions.users.first();

        if (mention) {
           
            const targetData = await getUser(mention.id);
            if (!targetData) {
                return message.reply({ embeds: [SimpleEmbed(`<@${mention.id}> doesn't exist or is invalid.`)] });
            }

            
            targetData.balance += amount;

          
            try {
                await targetData.save();
                message.reply({ embeds: [EmbedSeccessfully(`Successfully added ${sym}${amount}£${sym} to <@${mention.id}>`)] });
               // await mention.send({ embeds: [EmbedSeccessfully(`You have received ${sym}${amount}£${sym} from <@${user.id}>`)] });
            } catch (error) {
                console.error(error);
                return message.reply({ embeds: [SimpleEmbed('An error occurred while saving the data.')] });
            }

        } else {
            
            userData.balance += amount;

            
            try {
                await userData.save();
                message.reply({ embeds: [EmbedSeccessfully(`Successfully added ${sym}${amount}£${sym} to your balance.`)] });
            } catch (error) {
                console.error(error);
                return message.reply({ embeds: [SimpleEmbed('An error occurred while saving the data.')] });
            }
        }
    }
};

// SimpleEmbed function for creating error message embeds
const SimpleEmbed = (message) => {
    return new EmbedBuilder().setDescription(message).setColor('#FF0000');
};
//embed Fully
const EmbedSeccessfully = (message) => {
    return new EmbedBuilder().setDescription(message).setColor('#FFFF00');
};

//embed color yellow
const EmbedYellow = (message) => {
    return new EmbedBuilder().setDescription(message).setColor('#00FF00');
};
