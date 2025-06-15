// commands/setsystem.js
const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
const systemStateManager = require('../systems/systemStateManager.js'); // Importa el gestor de estados

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setsystem')
        .setDescription('Activa o desactiva los sistemas internos del bot.')
        .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageGuild) // Requiere permiso de "Gestionar Servidor"
        .setDMPermission(false) // No permite el uso en mensajes directos
        .addStringOption(option =>
            option.setName('sistema')
                .setDescription('El nombre del sistema a configurar.')
                .setRequired(true)
                .addChoices(
                    { name: 'Bienvenida', value: 'welcome' },
                    { name: 'Despedida', value: 'farewell' },
                    { name: 'Boosts del Servidor', value: 'boost' },
                    // Puedes añadir más sistemas aquí a medida que los crees
                ))
        .addStringOption(option =>
            option.setName('estado')
                .setDescription('Activar o desactivar el sistema.')
                .setRequired(true)
                .addChoices(
                    { name: 'Activar', value: 'on' },
                    { name: 'Desactivar', value: 'off' }
                )),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: false }); // Respuesta pública

        const systemName = interaction.options.getString('sistema');
        const stateString = interaction.options.getString('estado');
        const newState = stateString === 'on';

        // --- INICIO DE LA CORRECCIÓN CRÍTICA ---
        // Esta comprobación es VITAL. Si 'systemName' es nulo o indefinido, esto lo captura.
        // Si este mensaje NO aparece, significa que esta versión del código NO se está ejecutando.
        if (!systemName) {
            console.error('[Error setsystem] systemName es nulo. Revisar registro de comandos o caché de Discord.');
            const errorEmbed = new EmbedBuilder()
                .setColor('#E74C3C')
                .setTitle('❌ Error: Opción Faltante')
                .setDescription('Parece que no se proporcionó el nombre del sistema. Por favor, asegúrate de seleccionar una opción válida de la lista.')
                .setTimestamp()
                .setFooter({ text: 'Slim Shaidy Bot' });
            return interaction.editReply({ embeds: [errorEmbed] });
        }
        // --- FIN DE LA CORRECCIÓN CRÍTICA ---

        systemStateManager.setState(systemName, newState);

        const embed = new EmbedBuilder()
            .setColor(newState ? '#2ECC71' : '#E74C3C') // Verde para ON, Rojo para OFF
            .setTitle('⚙️ Estado del Sistema Actualizado')
            .setDescription(`El sistema **${systemName.charAt(0).toUpperCase() + systemName.slice(1)}** ha sido **${newState ? 'activado' : 'desactivado'}**.`)
            .setTimestamp()
            .setFooter({ text: 'Slim Shaidy Bot - Gestión de Sistemas' });

        await interaction.editReply({ embeds: [embed] });
    },
};