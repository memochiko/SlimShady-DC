const { SlashCommandBuilder, PermissionsBitField, ChannelType, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Elimina una cantidad de mensajes del canal.')
        .addIntegerOption(option =>
            option.setName('cantidad')
                .setDescription('Número de mensajes a eliminar (máx. 100).')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(100))
        .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageMessages) // Requiere permiso de "Gestionar Mensajes"
        .setDMPermission(false), // No permite el uso en mensajes directos
    async execute(interaction) {
        const amount = interaction.options.getInteger('cantidad');

        // Verificar si el canal es de texto
        if (interaction.channel.type !== ChannelType.GuildText) {
            return interaction.reply({ content: 'Este comando solo se puede usar en un canal de texto.', ephemeral: true });
        }

        // Deferir la respuesta de forma efímera
        await interaction.deferReply({ ephemeral: true });

        try {
            const fetched = await interaction.channel.messages.fetch({ limit: amount });
            const deletedMessages = await interaction.channel.bulkDelete(fetched, true); // true para filtrar mensajes antiguos

            const embed = new EmbedBuilder()
                .setColor('#E74C3C')
                .setTitle('🗑️ Mensajes Eliminados')
                .setDescription(`Se eliminaron **${deletedMessages.size}** mensajes en este canal.`)
                .setTimestamp()
                .setFooter({ text: 'Slim Shady Bot' });

            await interaction.editReply({ embeds: [embed] });
            // Después de un breve retraso, eliminar el mensaje de confirmación del bot si es necesario
            setTimeout(() => interaction.deleteReply().catch(console.error), 5000);

        } catch (error) {
            console.error('Error al eliminar mensajes:', error);
            if (error.code === 50034) { // Mensajes de más de 14 días
                await interaction.editReply('No se pueden eliminar mensajes de más de 14 días.');
            } else {
                await interaction.editReply('Hubo un error al intentar eliminar los mensajes. Asegúrate de que tengo los permisos necesarios.');
            }
        }
    },
};