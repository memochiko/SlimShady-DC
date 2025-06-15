const { EmbedBuilder } = require('discord.js');
const config = require('../config.js');

module.exports = {
    async execute(member, client) {
        if (member.user.bot) return;

        const farewellChannel = member.guild.channels.cache.get(config.farewellChannelId);

        if (!farewellChannel) {
            console.warn(`[ADVERTENCIA] No se encontró el canal de despedida (ID: ${config.farewellChannelId}).`);
            return;
        }

        const embed = new EmbedBuilder()
            .setColor('#e74c3c')
            .setTitle(`👋 ¡Adiós, ${member.user.username}!`)
            .setDescription(`**${member.user.tag}** nos ha dejado. ¡Lo echaremos de menos!`)
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 256 }))
            .setTimestamp()
            .setFooter({ text: 'Slim Shady Bot' });

        try {
            await farewellChannel.send({ embeds: [embed] });
        } catch (error) {
            console.error(`Error al enviar mensaje de despedida en el canal ${farewellChannel.name}:`, error);
        }
    },
};