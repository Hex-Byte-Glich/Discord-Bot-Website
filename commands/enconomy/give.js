const { getUser } = require('../../msc/functions'); 
const { EmbedBuilder } = require('discord.js');
const { description } = require('./balance');
const sym = '`';

module.exports = {
    name: 'give',
    aliases: ['g', 'gv'],
    description: 'pay the egyption pound to target',
    async execute(client, message, args) {
        try {
            const user = message.author;

            // Get user data from the database
            const userData = await getUser(user.id);

            const startOfDay = new Date();
            startOfDay.setHours(0, 0, 0, 0); // Start of today

            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1); // Tomorrow
            tomorrow.setHours(0, 0, 0, 0);

            if (userData.next_day < startOfDay || !userData.next_day) {
                userData.next_day = tomorrow;
                userData.balance_limit = 0;
                try { await userData.save(); } catch (error) { console.error(`Error saving user data: ${error}`); }
            }

            let balanceLimit = 1000000;

            let amount_cash = args[0];
            let amount = parseInt(amount_cash);

            if (isNaN(amount)) {
                amount_cash = args[1];
                amount = parseInt(amount_cash);
            }

            if (amount_cash.toLowerCase().endsWith('k')) {
                amount *= 1000;
            } else if (amount_cash.toLowerCase().endsWith('m')) {
                amount *= 1000000;
            }

            if (isNaN(amount) || amount <= 0) {
                message.reply({ embeds: [SimpleEmbed(`**Now <@${user.id}> how much you want to transfer?**`)] });
                return;
            }

            if (amount > userData.balance) {
                message.reply({ embeds: [SimpleEmbed(`**Now <@${user.id}> your virus beta balance is not enough**`)] });
                return;
            }

            const leftLimit = balanceLimit - userData.balance_limit;
            if (amount > leftLimit) {
                amount = leftLimit;
            }

            const mention = message.mentions.users.first();
            if (!mention) {
                // If no user was mentioned, inform the sender
                message.reply({ embeds: [SimpleEmbed(`**Please mention a valid user to send money to.**`)] });
                return;
            }

            const targetData = await getUser(mention.id);

            if (!targetData) {
                message.reply({ embeds: [SimpleEmbed(`<@${mention.id}> Do not playing VIRUS BETA`)] });
                return;
            }

            if (mention.id === user.id) {
                message.reply({ embeds: [SimpleEmbed('You cannot give to yourself')] });
                return;
            }

            // Perform the transaction
            const sender = message.author;
            const recipient = mention;

            // Update balances
            userData.balance_limit += amount;
            userData.balance -= amount;
            targetData.balance += amount;

            // Save the updated user data
            try {
                await userData.save();
                await targetData.save();
            } catch (error) {
                console.error(`Error saving user data: ${error}`);
                return message.channel.send({ embeds: [SimpleEmbed('An error occurred while saving data.')] });
            }

            // Send success messages
            const successEmbed = new EmbedBuilder()
                .setTitle('Transaction egyption pound Successfully')
                .setDescription(`You have successfully transfer ${sym}${amount}£${sym} to ${sym}${recipient.username}${sym}.`)
                .setColor('#00FF00')
                .setFooter({
                    text: `${userData.username} pay to ${targetData.username} in egyption pound ${sym}${amount}£${sym}`,
                    iconURL: message.author.displayAvatarURL({ dynamic: true })
                })
             

            await message.channel.send({ embeds: [successEmbed] });

        } catch (error) {
            console.error(error);
            return message.channel.send({ embeds: [SimpleEmbed('An error occurred while processing the transaction.')] });
        }
    }
};

// SimpleEmbed function for creating error message embeds
const SimpleEmbed = (message) => {
    return new EmbedBuilder().setDescription(message).setColor('#FF0000');
};
