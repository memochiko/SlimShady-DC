const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Banea a un miembro del servidor. Requiere permiso de "Banear Miembros".')
        .addUserOption(option =>
            option.setName('target')
                .setDescription('El miembro a banear.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('razon')
                .setDescription('La razón del baneo.')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionsBitField.Flags.BanMembers), // Establece el permiso requerido
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true }); // Deferir la respuesta de forma efímera

        const targetUser = interaction.options.getUser('target');
        const member = interaction.guild.members.cache.get(targetUser.id);
        const reason = interaction.options.getString('razon') || 'Sin razón especificada.';

        // Comprobaciones de permisos y jerarquía
        if (!member) {
            return interaction.editReply('No se encontró a ese miembro en el servidor.');
        }
        if (member.id === interaction.user.id) {
            return interaction.editReply('No puedes banearte a ti mismo.');
        }
        if (member.id === interaction.client.user.id) {
            return interaction.editReply('No puedo banearme a mí mismo.');
        }
        if (member.roles.highest.position >= interaction.member.roles.highest.position) {
            return interaction.editReply('No puedes banear a alguien con un rol igual o superior al tuyo.');
        }
        if (member.roles.highest.position >= interaction.guild.members.me.roles.highest.position) {
            return interaction.editReply('No puedo banear a este usuario porque tiene un rol igual o superior al mío.');
        }

        try {
            await member.ban({ reason: reason });
            const embed = new EmbedBuilder()
                .setColor('#f39c12')
                .setTitle('🔨 Miembro Baneado')
                .setDescription(`**${member.user.tag}** ha sido baneado.`)
                .addFields(
                    { name: 'Razón', value: reason }
                )
                .setTimestamp()
                .setFooter({ text: 'Slim Shady Bot' });

            await interaction.editReply({ content: ' ', embeds: [embed], ephemeral: false }); // Responder públicamente
        } catch (error) {
            console.error('Error al banear miembro:', error);
            await interaction.editReply('No pude banear a ese miembro. Asegúrate de que tengo los permisos necesarios y mi rol esté por encima del suyo.');
        }
    },
};