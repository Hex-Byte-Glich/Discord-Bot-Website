const { EmbedBuilder, PermissionsBitField, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

// Replace with the actual admin IDs
const ADMIN_IDS = ['1134766694506700821', '1062744885159010417']; // Add as many admin IDs as needed

module.exports = {
    name: 'serverlist',
    aliases: ['sl'],
    description: 'Lists all servers the bot is in. [admin]',
    cooldown: 5,
    async execute(client, message, args) {
        // Check if the message author is in the list of admin IDs
        if (!ADMIN_IDS.includes(message.author.id)) {
            return message.reply('You do not have permission to use this command.');
        }

        try {
            const guilds = client.guilds.cache;

            // Function to get an invite link for a guild
            async function getInviteLink(guild) {
                try {
                    // Find a suitable text channel with 'CREATE_INSTANT_INVITE' permission
                    const defaultChannel = guild.channels.cache.find(c => c.isTextBased() && c.permissionsFor(guild.members.me).has(PermissionsBitField.Flags.CreateInstantInvite));
                    
                    if (defaultChannel) {
                        const invite = await defaultChannel.createInvite({ maxAge: 3600, unique: true }); // Invite valid for 1 hour
                        return `https://discord.gg/${invite.code}`;
                    } else {
                        return 'No invite link available';
                    }
                } catch (error) {
                    console.error(`Error creating invite link for guild ${guild.id}: ${error.message}`);
                    return 'Error creating invite link';
                }
            }

            // Create the list with guild names, IDs, and invite links
            const guildList = await Promise.all(guilds.map(async (guild) => {
                const inviteLink = await getInviteLink(guild);
                return `${guild.name} (ID: ${guild.id}) - [Join](${inviteLink})`;
            }));

            // Function to create paginated embeds
            const createEmbed = (page) => {
                const pageSize = 10; // Number of servers per page
                const start = page * pageSize;
                const end = start + pageSize;
                const pagedGuilds = guildList.slice(start, end);

                const embed = new EmbedBuilder()
                    .setTitle(`Bot Server List (Page ${page + 1}/${Math.ceil(guildList.length / pageSize)})`)
                    .setDescription(pagedGuilds.join('\n') || 'No servers found.')
                    .setColor('#00FF00')
                    .setFooter({ text: `Total Servers: ${guilds.size}` });

                return embed;
            };

            let currentPage = 0;
            const embed = createEmbed(currentPage);

            // Define buttons for pagination
            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('prev')
                    .setLabel('Previous')
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId('next')
                    .setLabel('Next')
                    .setStyle(ButtonStyle.Primary)
            );

            // Send the initial embed with navigation buttons if necessary
            const messageSent = await message.reply({
                embeds: [embed],
                components: guildList.length > 10 ? [row] : []
            });

            // Button collector for pagination
            const filter = (i) => i.user.id === message.author.id;
            const collector = messageSent.createMessageComponentCollector({ filter, time: 60000 });

            collector.on('collect', async (interaction) => {
                if (interaction.customId === 'prev' && currentPage > 0) {
                    currentPage--;
                } else if (interaction.customId === 'next' && (currentPage + 1) * 10 < guildList.length) {
                    currentPage++;
                }

                await interaction.update({ embeds: [createEmbed(currentPage)] });
            });

            collector.on('end', () => {
                if (messageSent.editable) {
                    messageSent.edit({ components: [] }); // Remove buttons after collector ends
                }
            });

        } catch (error) {
            console.error(`Error executing serverlist command: ${error.message}`);
            await message.reply('An error occurred while fetching the server list.');
        }
    },
};
