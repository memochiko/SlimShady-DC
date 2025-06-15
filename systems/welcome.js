const { EmbedBuilder } = require('discord.js');
const config = require('../config.js');

module.exports = {
    async execute(member, client) {
        if (member.user.bot) return;

        const welcomeChannel = member.guild.channels.cache.get(config.welcomeChannelId);

        if (!welcomeChannel) {
            console.warn(`[ADVERTENCIA] No se encontró el canal de bienvenida (ID: ${config.welcomeChannelId}).`);
            return;
        }

        const embed = new EmbedBuilder()
            .setColor('#2ecc71')
            .setTitle(`🎉 ¡Bienvenido al servidor, ${member.user.username}!`)
            .setDescription(`¡Nos alegra tenerte aquí, <@${member.user.id}>!\nEres el miembro número **${member.guild.memberCount}** de este servidor.`)
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 256 }))
            .addFields(
                { name: 'Lee las reglas', value: 'Asegúrate de revisar el canal de <#TU_CANAL_DE_REGLAS_AQUI>.' }, // ¡CAMBIA ESTO!
                { name: 'Diviértete', value: '¡Esperamos que disfrutes tu estancia!' }
            )
            .setTimestamp()
            .setFooter({ text: 'Slim Shaidy Bot' });

        try {
            await welcomeChannel.send({ embeds: [embed] });
        } catch (error) {
            console.error(`Error al enviar mensaje de bienvenida en el canal ${welcomeChannel.name}:`, error);
        }
    },
};