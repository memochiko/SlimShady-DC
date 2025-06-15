// systems/welcome.js
const { EmbedBuilder } = require('discord.js');
const config = require('../config.js');
const systemStateManager = require('./systemStateManager.js'); // Importa el gestor de estados

module.exports = {
    /**
     * Ejecuta el sistema de bienvenida cuando un miembro se une.
     * @param {GuildMember} member - El miembro que se unió.
     * @param {Client} client - La instancia del cliente del bot principal.
     */
    execute: async (member, client) => {
        // Verifica si el sistema de bienvenida está activado
        if (!systemStateManager.getState('welcome')) {
            return; // Si está desactivado, no hace nada
        }

        const welcomeChannelId = config.welcomeChannelId;
        if (!welcomeChannelId) {
            console.warn('[WelcomeSystem] ID del canal de bienvenida no configurado en config.js. Saltando bienvenida.');
            return;
        }

        const channel = member.guild.channels.cache.get(welcomeChannelId);
        if (!channel) {
            console.error(`[WelcomeSystem] No se encontró el canal de bienvenida con ID: ${welcomeChannelId}`);
            return;
        }

        const embed = new EmbedBuilder()
            .setColor('#2ECC71') // Verde para bienvenida
            .setTitle('👋 ¡Bienvenido al Servidor!')
            .setDescription(`¡Bienvenido a ${member.guild.name}, **${member.user.tag}**! ¡Esperamos que disfrutes tu estancia!`)
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 256 }))
            .addFields(
                { name: 'Miembro', value: `${member.user}`, inline: true },
                { name: 'Número de Miembros', value: `${member.guild.memberCount}`, inline: true }
            )
            .setTimestamp()
            .setFooter({ text: 'Slim Shaidy Bot' });

        try {
            await channel.send({ embeds: [embed] });
        } catch (error) {
            console.error(`[WelcomeSystem] Error al enviar mensaje de bienvenida al canal ${channel.name}:`, error);
        }
    },
};