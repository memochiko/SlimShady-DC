// systems/farewell.js
const { EmbedBuilder } = require('discord.js');
const config = require('../config.js');
const systemStateManager = require('./systemStateManager.js'); // Importa el gestor de estados

module.exports = {
    /**
     * Ejecuta el sistema de despedida cuando un miembro abandona.
     * @param {GuildMember} member - El miembro que abandonó.
     * @param {Client} client - La instancia del cliente del bot principal.
     */
    execute: async (member, client) => {
        // Verifica si el sistema de despedida está activado
        if (!systemStateManager.getState('farewell')) {
            return; // Si está desactivado, no hace nada
        }

        const farewellChannelId = config.farewellChannelId;
        if (!farewellChannelId) {
            console.warn('[FarewellSystem] ID del canal de despedida no configurado en config.js. Saltando despedida.');
            return;
        }

        const channel = member.guild.channels.cache.get(farewellChannelId);
        if (!channel) {
            console.error(`[FarewellSystem] No se encontró el canal de despedida con ID: ${farewellChannelId}`);
            return;
        }

        const embed = new EmbedBuilder()
            .setColor('#E74C3C') // Rojo para despedida
            .setTitle('👋 ¡Adiós!')
            .setDescription(`**${member.user.tag}** ha abandonado el servidor ${member.guild.name}. ¡Hasta pronto!`)
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 256 }))
            .addFields(
                { name: 'Miembro', value: `${member.user.tag} (ID: ${member.user.id})`, inline: true },
                { name: 'Número de Miembros Restantes', value: `${member.guild.memberCount}`, inline: true }
            )
            .setTimestamp()
            .setFooter({ text: 'Slim Shaidy Bot' });

        try {
            await channel.send({ embeds: [embed] });
        } catch (error) {
            console.error(`[FarewellSystem] Error al enviar mensaje de despedida al canal ${channel.name}:`, error);
        }
    },
};