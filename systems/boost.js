const { EmbedBuilder } = require('discord.js');
const config = require('../config.js');

module.exports = {
    async execute(oldMember, newMember, client) {
        const oldPremium = oldMember.premiumSince;
        const newPremium = newMember.premiumSince;

        if (!oldPremium && newPremium) {
            const boostChannel = newMember.guild.channels.cache.get(config.boostChannelId);

            if (!boostChannel) {
                console.warn(`[ADVERTENCIA] No se encontró el canal de boost (ID: ${config.boostChannelId}).`);
                return;
            }

            const embed = new EmbedBuilder()
                .setColor('#f47fff')
                .setTitle('🚀 ¡Nuevo Boost del Servidor!')
                .setDescription(`¡Muchísimas gracias a **<@${newMember.user.id}>** por boostear el servidor!`)
                .setThumbnail(newMember.user.displayAvatarURL({ dynamic: true, size: 256 }))
                .addFields(
                    { name: 'Nivel de Boost', value: `${newMember.guild.premiumTier}`, inline: true },
                    { name: 'Total de Boosts', value: `${newMember.guild.premiumSubscriptionCount}`, inline: true }
                )
                .setTimestamp()
                .setFooter({ text: 'Slim Shaidy Bot' });
				
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