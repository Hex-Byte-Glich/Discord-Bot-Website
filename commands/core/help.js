const { prefix } = require('../../data/config.json');
const fs = require('fs');
const path = require('path');
const { EmbedBuilder } = require('discord.js');
const sym = '`';

module.exports = {
    name: 'help',
    aliases: ['h'],
    description: 'Commands Help',
    async execute(client, message, args) {
        try {
            // Get the user from the message
            const user = message.author;

            // Function to recursively load command files from all folders and subfolders
            const loadCommands = (dir) => {
                const commandFiles = fs.readdirSync(dir);
                let commands = [];

                for (const file of commandFiles) {
                    const fullPath = path.join(dir, file);
                    const stat = fs.statSync(fullPath);

                    // If it's a directory, recurse into it
                    if (stat.isDirectory()) {
                        commands = commands.concat(loadCommands(fullPath));
                    } else if (file.endsWith('.js')) {
                        // If it's a JavaScript file, require the command and add it to the list
                        const command = require(fullPath);
                        commands.push({ name: `${prefix}${command.name}`, description: command.description });
                    }
                }

                return commands;
            };

            // Load all commands from the 'commands' folder (and its subfolders)
            const commands = loadCommands(path.join(__dirname, '../../commands'));

            // Create the embed with the commands list
            const embed = new EmbedBuilder()
                .setColor('#FFFF00')
                .setTitle(`${client.user.username}'s Commands`)
                .setDescription('Here are all the commands you can use:')
                .setTimestamp()
                .setFooter({ text: 'Use the commands with the prefix !' });

            // Add each command to the embed as a field
            commands.forEach(command => {
                embed.addFields({
                    name: `${sym}${command.name}${sym}`,
                    value: `${command.description}`,
                    inline: false
                });
            });

            // Send the embed in response to the message
            await message.channel.send({ embeds: [embed] });
        } catch (error) {
            console.error('Error fetching user data:', error);
            await message.channel.send('An error occurred while fetching the help information. Please try again later.');
        }
    },
};
