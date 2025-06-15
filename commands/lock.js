const { SlashCommandBuilder, PermissionsBitField, ChannelType, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('lock')
        .setDescription('Bloquea el canal actual, impidiendo que @everyone envíe mensajes.')
        .addStringOption(option =>
            option.setName('razon')
                .setDescription('La razón para bloquear el canal.')
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

            // Verificar si el canal ya está bloqueado
            if (!channel.permissionsFor(everyoneRole).has(PermissionsBitField.Flags.SendMessages) &&
                channel.permissionsFor(everyoneRole).deny.has(PermissionsBitField.Flags.SendMessages)) {
                return interaction.editReply('Este canal ya parece estar bloqueado para @everyone.');
            }

            // Denegar el permiso de enviar mensajes para @everyone
            await channel.permissionOverwrites.edit(everyoneRole, {
                SendMessages: false,
            }, { reason: `Canal bloqueado por ${interaction.user.tag} - ${reason}` });

            const embed = new EmbedBuilder()
                .setColor('#E74C3C')
                .setTitle('🔒 Canal Bloqueado')
                .setDescription(`Este canal ha sido bloqueado por <@${interaction.user.id}>.`)
                .addFields(
                    { name: 'Razón', value: reason }
                )
                .setTimestamp()
                .setFooter({ text: 'Slim Shaidy Bot' });

            await interaction.editReply({ content: ' ', embeds: [embed], ephemeral: false });

        } catch (error) {
            console.error('Error al bloquear canal:', error);
            await interaction.editReply('Hubo un error al bloquear el canal. Asegúrate de que tengo los permisos necesarios.');
        }
    },
};