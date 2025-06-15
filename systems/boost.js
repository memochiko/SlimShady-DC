// systems/boost.js
const { EmbedBuilder } = require('discord.js');
const config = require('../config.js');
const systemStateManager = require('./systemStateManager.js'); // Importa el gestor de estados

module.exports = {
    /**
     * Ejecuta el sistema de boosts cuando un miembro actualiza su estado (para detectar boosts).
     * @param {GuildMember} oldMember - El estado anterior del miembro.
     * @param {GuildMember} newMember - El nuevo estado del miembro.
     * @param {Client} client - La instancia del cliente del bot principal.
     */
    execute: async (oldMember, newMember, client) => {
        // Verifica si el sistema de boosts está activado
        if (!systemStateManager.getState('boost')) {
            return; // Si está desactivado, no hace nada
        }

        // Comprueba si el miembro ha empezado a boostear el servidor
        const oldPremiumSince = oldMember.premiumSince;
        const newPremiumSince = newMember.premiumSince;

        if (!oldPremiumSince && newPremiumSince) {
            // El usuario acaba de empezar a boostear
            const boostChannelId = config.boostChannelId;
            if (!boostChannelId) {
                console.warn('[BoostSystem] ID del canal de boosts no configurado en config.js. Saltando notificación de boost.');
                return;
            }

            const channel = newMember.guild.channels.cache.get(boostChannelId);
            if (!channel) {
                console.error(`[BoostSystem] No se encontró el canal de boosts con ID: ${boostChannelId}`);
                return;
            }

            const embed = new EmbedBuilder()
                .setColor('#FF73FA') // Color rosa brillante para boosts
                .setTitle('✨ ¡Gracias por el Boost!')
                .setDescription(`¡Muchísimas gracias a **${newMember.user.tag}** por boostear el servidor! 🎉\n\nTu apoyo nos ayuda a mejorar y desbloquear nuevas ventajas.`)
                .setThumbnail(newMember.user.displayAvatarURL({ dynamic: true, size: 256 }))
                .addFields(
                    { name: 'Booster', value: `${newMember.user}`, inline: true },
                    { name: 'Nivel del Servidor', value: `Nivel ${newMember.guild.premiumTier}`, inline: true },
                    { name: 'Total de Boosts', value: `${newMember.guild.premiumSubscriptionCount || 0}`, inline: true }
                )
                .setTimestamp()
                .setFooter({ text: 'Slim Shaidy Bot' });

            try {
                await channel.send({ embeds: [embed] });
            } catch (error) {
                console.error(`[BoostSystem] Error al enviar mensaje de boost al canal ${channel.name}:`, error);
            }
        }
        // Puedes añadir lógica para cuando dejan de boostear si lo deseas
        // else if (oldPremiumSince && !newPremiumSince) {
        //     // El usuario ha dejado de boostear
        // }
    },
};