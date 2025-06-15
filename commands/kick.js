const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Expulsa a un miembro del servidor. Requiere permiso de "Expulsar Miembros".')
        .addUserOption(option =>
            option.setName('target')
                .setDescription('El miembro a expulsar.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('razon')
                .setDescription('La razón de la expulsión.')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionsBitField.Flags.KickMembers),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const targetUser = interaction.options.getUser('target');
        const member = interaction.guild.members.cache.get(targetUser.id);
        const reason = interaction.options.getString('razon') || 'Sin razón especificada.';

        if (!member) {
            return interaction.editReply('No se encontró a ese miembro en el servidor.');
        }
        if (member.id === interaction.user.id) {
            return interaction.editReply('No puedes expulsarte a ti mismo.');
        }
        if (member.id === interaction.client.user.id) {
            return interaction.editReply('No puedo expulsarme a mí mismo.');
        }
        if (member.roles.highest.position >= interaction.member.roles.highest.position) {
            return interaction.editReply('No puedes expulsar a alguien con un rol igual o superior al tuyo.');
        }
        if (member.roles.highest.position >= interaction.guild.members.me.roles.highest.position) {
            return interaction.editReply('No puedo expulsar a este usuario porque tiene un rol igual o superior al mío.');
        }

        try {
            await member.kick(reason);
            const embed = new EmbedBuilder()
                .setColor('#e74c3c')
                .setTitle('🦶 Miembro Expulsado')
                .setDescription(`**${member.user.tag}** ha sido expulsado.`)
                .addFields(
                    { name: 'Razón', value: reason }
                )
                .setTimestamp()
                .setFooter({ text: 'Slim Shady Bot' });

            await interaction.editReply({ content: ' ', embeds: [embed], ephemeral: false });
        } catch (error) {
            console.error('Error al expulsar miembro:', error);
            await interaction.editReply('No pude expulsar a ese miembro. Asegúrate de que tengo los permisos necesarios y mi rol esté por encima del suyo.');
        }
    },
};