const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../config.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('about')
        .setDescription('Muestra información sobre el propósito del bot y su desarrollador.'),
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setColor('#2ecc71')
            .setTitle('🤖 Sobre Slim Shady')
            .setDescription(
                'Soy un bot de Discord multi-propósito diseñado para mejorar tu experiencia en el servidor. ' +
                'Ofrezco una variedad de comandos de utilidad, diversión y moderación para mantener la comunidad activa y segura.'
            )
            .addFields(
                { name: 'Desarrollador', value: config.ownerName, inline: true }, // ¡ACTUALIZA ESTO!
                { name: 'Contacto', value: 'Si tienes preguntas o sugerencias, contacta a mi desarrollador.', inline: true },
                { name: 'Código Fuente', value: 'No disponible públicamente en este momento.', inline: false } // O pon un enlace a tu GitHub si lo tienes
            )
            .setThumbnail(interaction.client.user.displayAvatarURL())
            .setTimestamp()
            .setFooter({ text: 'Slim Shaidy Bot' });

        await interaction.reply({ embeds: [embed] });
    },
};