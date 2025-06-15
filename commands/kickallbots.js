const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField, ChannelType } = require('discord.js');
const fetch = require('node-fetch'); // Utilizado por comandos que interactúan con APIs externas
const config = require('../config.js'); // Importa la configuración si el comando lo necesita (ej. para ID de Owner)
const warningSystem = require('../systems/warningSystem.js'); // Importa el sistema de advertencias

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kickallbots')
        .setDescription('Expulsa a todos los bots del servidor (excepto a mí mismo).')
        .setDefaultMemberPermissions(PermissionsBitField.Flags.KickMembers)
        .setDMPermission(false),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const botsKicked = [];
        const members = await interaction.guild.members.fetch(); // Asegurarse de tener todos los miembros

        for (const [id, member] of members) {
            if (member.user.bot && member.id !== interaction.client.user.id) { // No expulsarse a sí mismo
                try {
                    await member.kick('Purge de bots por comando /kickallbots.');
                    botsKicked.push(member.user.tag);
                } catch (error) {
                    console.error(`No se pudo expulsar al bot ${member.user.tag}:`, error);
                }
            }
        }

        const embed = new EmbedBuilder()
            .setColor('#E74C3C')
            .setTitle('🤖 Purga de Bots')
            .setDescription(`Se han expulsado **${botsKicked.length}** bots del servidor.`)
            .addFields(
                { name: 'Bots Expulsados', value: botsKicked.length > 0 ? botsKicked.join(', ') : 'Ninguno (o no pude expulsarlos).', inline: false }
            )
            .setTimestamp()
            .setFooter({ text: 'Slim Shady Bot' });

        await interaction.editReply({ content: ' ', embeds: [embed], ephemeral: false });
    },
};