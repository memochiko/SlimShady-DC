const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('purgebots')
        .setDescription('Elimina una cantidad de mensajes enviados por bots en el canal actual.')
        .addIntegerOption(option =>
            option.setName('cantidad')
                .setDescription('Número de mensajes a escanear (máx. 100).')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(100))
        .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageMessages)
        .setDMPermission(false),
    async execute(interaction) {
        const amount = interaction.options.getInteger('cantidad');
        await interaction.deferReply({ ephemeral: true });

        try {
            const messages = await interaction.channel.messages.fetch({ limit: amount });
            const botMessages = messages.filter(msg => msg.author.bot);

            if (botMessages.size === 0) {
                return interaction.editReply('No se encontraron mensajes de bots en los últimos ' + amount + ' mensajes.');
            }

            const deletedMessages = await interaction.channel.bulkDelete(botMessages, true); // true para filtrar mensajes antiguos
            
            const embed = new EmbedBuilder()
                .setColor('#E74C3C')
                .setTitle('🗑️ Mensajes de Bots Eliminados')
                .setDescription(`Se eliminaron **${deletedMessages.size}** mensajes de bots.`)
                .setTimestamp()
                .setFooter({ text: 'Slim Shady Bot' });

            await interaction.editReply({ content: ' ', embeds: [embed], ephemeral: false });
            setTimeout(() => interaction.deleteReply().catch(console.error), 5000); // Eliminar la respuesta después de 5 segundos

        } catch (error) {
            console.error('Error al purgar mensajes de bots:', error);
            if (error.code === 50034) {
                await interaction.editReply('No se pueden eliminar mensajes de bots de más de 14 días.');
            } else {
                await interaction.editReply('Hubo un error al intentar purgar los mensajes. Asegúrate de que tengo los permisos necesarios.');
            }
        }
    },
};