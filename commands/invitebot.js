const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../config.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('invitebot')
        .setDescription('Genera un enlace de invitación para añadir el bot a tu servidor.'),
    async execute(interaction) {
        if (!config.clientId) {
            return interaction.reply({ content: 'El ID de cliente del bot no está configurado en `config.js`. No se puede generar el enlace de invitación.', ephemeral: true });
        }

        // Para permisos más específicos, visita: https://discordapi.com/permissions.html
        const permissions = '8';
        const inviteLink = `https://discord.com/api/oauth2/authorize?client_id=${config.clientId}&permissions=${permissions}&scope=bot%20applications.commands`;

        const embed = new EmbedBuilder()
            .setColor('#7289DA') // Color de Discord
            .setTitle('🔗 Invita a Slim Shady a tu servidor')
            .setDescription(`¡Haz clic en el enlace de abajo para invitarme a tu servidor!\n\n[Enlace de Invitación](${inviteLink})`)
            .setThumbnail(interaction.client.user.displayAvatarURL())
            .setTimestamp()
            .setFooter({ text: 'Slim Shady Bot' });

        await interaction.reply({ embeds: [embed] });
    },
};