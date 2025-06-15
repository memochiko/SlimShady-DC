const { EmbedBuilder } = require('discord.js');
const config = require('../config.js');

module.exports = {
    // La función execute se llamará cuando la información de un miembro sea actualizada (guildMemberUpdate event)
    async execute(oldMember, newMember, client) {
        // Verifica si el boost del miembro ha cambiado (de no boosted a boosted)
        const oldPremium = oldMember.premiumSince;
        const newPremium = newMember.premiumSince;

        // Si el miembro empezó a boostear
        if (!oldPremium && newPremium) {
            // Intenta obtener el canal de boost configurado
            const boostChannel = newMember.guild.channels.cache.get(config.boostChannelId);

            // Si no se encuentra el canal, se emite una advertencia y se sale
            if (!boostChannel) {
                console.warn(`[ADVERTENCIA] No se encontró el canal de boost (ID: ${config.boostChannelId}).`);
                return;
            }

            // Crea un embed para el mensaje de boost
            const embed = new EmbedBuilder()
                .setColor('#f47fff') // Color morado de Discord Nitro
                .setTitle('🚀 ¡Nuevo Boost del Servidor!')
                .setDescription(`¡Muchísimas gracias a **<@${newMember.user.id}>** por boostear el servidor!`)
                .setThumbnail(newMember.user.displayAvatarURL({ dynamic: true, size: 256 }))
                .addFields(
                    { name: 'Nivel de Boost', value: `${newMember.guild.premiumTier}`, inline: true },
                    { name: 'Total de Boosts', value: `${newMember.guild.premiumSubscriptionCount}`, inline: true }
                )
                .setTimestamp()
                .setFooter({ text: 'Slim Shaidy Bot' });

            // Envía el embed al canal de boost
            try {
                await boostChannel.send({ embeds: [embed] });
            } catch (error) {
                console.error(`Error al enviar mensaje de boost en el canal ${boostChannel.name}:`, error);
            }
        }
        // Puedes añadir lógica aquí para cuando un miembro deja de boostear, si lo deseas.
        // else if (oldPremium && !newPremium) {
        //     // El miembro dejó de boostear
        // }
    },
};
