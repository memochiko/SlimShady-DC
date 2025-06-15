const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('banlist')
        .setDescription('Muestra la lista de usuarios baneados del servidor.')
        .setDefaultMemberPermissions(PermissionsBitField.Flags.BanMembers) // Requiere permiso de banear
        .setDMPermission(false),
    async execute(interaction) {
        await interaction.deferReply();

        try {
            const bans = await interaction.guild.bans.fetch(); // Obtiene la colección de baneos

            if (bans.size === 0) {
                return interaction.editReply('No hay usuarios baneados en este servidor.');
            }

            let description = '';
            let count = 0;
            const maxCount = 10; // Limitar a los primeros 10 baneados para evitar embeds muy grandes

            for (const [userId, ban] of bans.entries()) {
                if (count >= maxCount) {
                    description += `\n...y ${bans.size - maxCount} más.`;
                    break;
                }
                description += `\`${ban.user.tag}\` (ID: \`${ban.user.id}\`) - Razón: ${ban.reason || 'Ninguna'}\n`;
                count++;
            }

            const embed = new EmbedBuilder()
                .setColor('#E74C3C')
                .setTitle('🚫 Lista de Baneos')
                .setDescription(description)
                .setTimestamp()
                .setFooter({ text: `Total de Baneos: ${bans.size} | Slim Shady Bot` });

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error('Error al obtener la lista de baneos:', error);
            await interaction.editReply('Hubo un error al obtener la lista de baneos. Asegúrate de que tengo los permisos necesarios.');
        }
    },
};