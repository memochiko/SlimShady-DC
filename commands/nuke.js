const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField, ChannelType } = require('discord.js');
const fetch = require('node-fetch'); // Utilizado por comandos que interactúan con APIs externas
const config = require('../config.js'); // Importa la configuración si el comando lo necesita (ej. para ID de Owner)
const warningSystem = require('../systems/warningSystem.js'); // Importa el sistema de advertencias

module.exports = {
    data: new SlashCommandBuilder()
        .setName('nuke')
        .setDescription('Elimina y recrea el canal actual, borrando todo el historial de mensajes. ¡Cuidado!.')
        .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageChannels)
        .setDMPermission(false),
    async execute(interaction) {
        const channel = interaction.channel;

        if (channel.type !== ChannelType.GuildText) {
            return interaction.reply({ content: 'Este comando solo se puede usar en un canal de texto.', ephemeral: true });
        }

        await interaction.reply({ content: '¡ADVERTENCIA! Este comando eliminará y recreará este canal, borrando todo el historial. ¿Estás seguro? Responde `confirmar` en los próximos 10 segundos para continuar.', ephemeral: false });

        const filter = m => m.author.id === interaction.user.id && m.content.toLowerCase() === 'confirmar';
        const collector = interaction.channel.createMessageCollector({ filter, time: 10000, max: 1 });

        collector.on('collect', async m => {
            await m.delete(); // Eliminar el mensaje de confirmación del usuario

            try {
                const position = channel.position;
                const parent = channel.parent;
                const channelName = channel.name;
                const channelTopic = channel.topic;
                const channelNsfw = channel.nsfw;
                const channelSlowmode = channel.rateLimitPerUser;
                const channelPermissions = channel.permissionOverwrites.cache.map(overwrite => ({
                    id: overwrite.id,
                    type: overwrite.type,
                    allow: overwrite.allow.bitfield,
                    deny: overwrite.deny.bitfield
                }));

                const newChannel = await channel.clone({
                    name: channelName,
                    reason: `Canal purgado por ${interaction.user.tag}`,
                    position: position,
                    parent: parent,
                    topic: channelTopic,
                    nsfw: channelNsfw,
                    rateLimitPerUser: channelSlowmode,
                    permissionOverwrites: channelPermissions
                });

                await channel.delete();

                const embed = new EmbedBuilder()
                    .setColor('#E74C3C')
                    .setTitle('💥 Canal Nukeado')
                    .setDescription(`El canal ${newChannel} ha sido eliminado y recreado, borrando todo el historial de mensajes.`)
                    .setImage('https://media.giphy.com/media/oe3pU54k9n7n7t3c3F/giphy.gif') // GIF de explosión o limpieza
                    .setTimestamp()
                    .setFooter({ text: 'Slim Shady Bot' });

                await newChannel.send({ embeds: [embed] });

            } catch (error) {
                console.error('Error al nukear canal:', error);
                await interaction.followUp({ content: 'Hubo un error al nukear el canal. Asegúrate de que tengo los permisos necesarios para gestionar canales.', ephemeral: true });
            }
        });

        collector.on('end', collected => {
            if (collected.size === 0) {
                interaction.followUp({ content: 'Tiempo de confirmación agotado. El canal no fue nukeado.', ephemeral: true }).catch(console.error);
            }
        });
    },
};