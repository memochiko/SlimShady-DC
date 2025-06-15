const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField, ChannelType } = require('discord.js');
const fetch = require('node-fetch'); // Utilizado por comandos que interactúan con APIs externas
const config = require('../config.js'); // Importa la configuración si el comando lo necesita (ej. para ID de Owner)
const warningSystem = require('../systems/warningSystem.js'); // Importa el sistema de advertencias

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unwarn')
        .setDescription('Elimina una advertencia específica de un usuario.')
        .addUserOption(option =>
            option.setName('target')
                .setDescription('El usuario del que quieres eliminar la advertencia.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('warning_id')
                .setDescription('El ID de la advertencia a eliminar (puedes verlo con /warnings).')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionsBitField.Flags.KickMembers)
        .setDMPermission(false),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const targetUser = interaction.options.getUser('target');
        const warningId = interaction.options.getString('warning_id');

        const success = warningSystem.removeWarning(targetUser.id, warningId);

        if (success) {
            const embed = new EmbedBuilder()
                .setColor('#2ECC71') // Verde
                .setTitle('✅ Advertencia Eliminada')
                .setDescription(`La advertencia con ID \`${warningId}\` de **${targetUser.tag}** ha sido eliminada.`)
                .setTimestamp()
                .setFooter({ text: 'Slim Shaidy Bot' });
            await interaction.editReply({ embeds: [embed] });
        } else {
            await interaction.editReply({ content: `No se encontró una advertencia con el ID \`${warningId}\` para **${targetUser.tag}**.`, ephemeral: true });
        }
    },
};