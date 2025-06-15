const { SlashCommandBuilder, PermissionsBitField, ChannelType, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unlock')
        .setDescription('Desbloquea el canal actual, permitiendo que @everyone envíe mensajes.')
        .addStringOption(option =>
            option.setName('razon')
                .setDescription('La razón para desbloquear el canal.')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageChannels) // Requiere permiso de "Gestionar Canales"
        .setDMPermission(false),
    async execute(interaction) {
        const channel = interaction.channel;
        const reason = interaction.options.getString('razon') || 'Sin razón especificada.';

        if (channel.type !== ChannelType.GuildText) {
            return interaction.reply({ content: 'Este comando solo se puede usar en un canal de texto.', ephemeral: true });
        }

        await interaction.deferReply({ ephemeral: true });

        try {
            // Obtener el rol @everyone
            const everyoneRole = interaction.guild.roles.cache.find(role => role.name === '@everyone');
            if (!everyoneRole) {
                return interaction.editReply('No se encontró el rol @everyone. Algo salió mal.');
            }

            // Verificar si el canal ya está desbloqueado
            if (channel.permissionsFor(everyoneRole).has(PermissionsBitField.Flags.SendMessages) &&
                !channel.permissionsFor(everyoneRole).deny.has(PermissionsBitField.Flags.SendMessages)) {
                return interaction.editReply('Este canal ya parece estar desbloqueado para @everyone.');
            }

            // Permitir el permiso de enviar mensajes para @everyone
            await channel.permissionOverwrites.edit(everyoneRole, {
                SendMessages: null, // Poner a null para que herede o explícitamente a true si es necesario.
            }, { reason: `Canal desbloqueado por ${interaction.user.tag} - ${reason}` });

            const embed = new EmbedBuilder()
                .setColor('#2ECC71')
                .setTitle('🔓 Canal Desbloqueado')
                .setDescription(`Este canal ha sido desbloqueado por <@${interaction.user.id}>.`)
                .addFields(
                    { name: 'Razón', value: reason }
                )
                .setTimestamp()
                .setFooter({ text: 'Slim Shaidy Bot' });

            await interaction.editReply({ content: ' ', embeds: [embed], ephemeral: false });

        } catch (error) {
            console.error('Error al desbloquear canal:', error);
            await interaction.editReply('Hubo un error al desbloquear el canal. Asegúrate de que tengo los permisos necesarios.');
        }
    },
};