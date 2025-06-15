const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField, ChannelType } = require('discord.js');
const fetch = require('node-fetch'); // Utilizado por comandos que interactúan con APIs externas
const config = require('../config.js'); // Importa la configuración si el comando lo necesita (ej. para ID de Owner)
const warningSystem = require('../systems/warningSystem.js'); // Importa el sistema de advertencias

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warnings')
        .setDescription('Muestra las advertencias de un usuario.')
        .addUserOption(option =>
            option.setName('usuario')
                .setDescription('El usuario cuyas advertencias quieres ver.')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionsBitField.Flags.KickMembers)
        .setDMPermission(false),
    async execute(interaction) {
        await interaction.deferReply();

        const targetUser = interaction.options.getUser('usuario');
        const warnings = warningSystem.getWarnings(targetUser.id);

        const embed = new EmbedBuilder()
            .setColor('#3498DB') // Azul
            .setTitle(`📜 Advertencias de ${targetUser.tag}`);

        if (warnings.length === 0) {
            embed.setDescription(`**${targetUser.tag}** no tiene advertencias.`);
        } else {
            let description = '';
            warnings.forEach((warning, index) => {
                const warningDate = new Date(warning.timestamp);
                description += `**ID**: \`${warning.id}\`\n`;
                description += `**Razón**: ${warning.reason}\n`;
                description += `**Fecha**: <t:${Math.floor(warningDate.getTime() / 1000)}:F>\n`;
                description += `**Moderador**: ${warning.moderator}\n`;
                if (index < warnings.length - 1) description += '---\n';
            });
            embed.setDescription(description.length > 4096 ? description.substring(0, 4093) + '...' : description); // Limita a 4096 caracteres
        }

        embed.setThumbnail(targetUser.displayAvatarURL({ dynamic: true, size: 256 }))
            .setTimestamp()
            .setFooter({ text: 'Slim Shady Bot' });

        await interaction.editReply({ embeds: [embed] });
    },
};