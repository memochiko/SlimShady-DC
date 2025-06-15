const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField, ChannelType } = require('discord.js');
const fetch = require('node-fetch'); // Utilizado por comandos que interactúan con APIs externas
const config = require('../config.js'); // Importa la configuración si el comando lo necesita (ej. para ID de Owner)
const warningSystem = require('../systems/warningSystem.js'); // Importa el sistema de advertencias


// 1. commands/warn.js
module.exports = {
    data: new SlashCommandBuilder()
        .setName('warn')
        .setDescription('Emite una advertencia a un usuario.')
        .addUserOption(option =>
            option.setName('target')
                .setDescription('El usuario a advertir.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('razon')
                .setDescription('La razón de la advertencia.')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionsBitField.Flags.KickMembers) // Permiso mínimo para advertir (ej. expulsar)
        .setDMPermission(false),
    async execute(interaction) {
        await interaction.deferReply();

        const targetUser = interaction.options.getUser('target');
        const reason = interaction.options.getString('razon') || 'Sin razón especificada.';
        const moderatorTag = interaction.user.tag;

        const member = interaction.guild.members.cache.get(targetUser.id);

        if (!member) {
            return interaction.editReply({ content: 'No se encontró a ese miembro en el servidor.', ephemeral: true });
        }

        // Evitar que el bot se advierta a sí mismo o al dueño del servidor si el bot no es el dueño
        if (member.id === interaction.client.user.id) {
            return interaction.editReply({ content: 'No puedes advertirme a mí mismo.', ephemeral: true });
        }
        if (member.id === interaction.guild.ownerId && interaction.user.id !== interaction.guild.ownerId) {
             return interaction.editReply({ content: 'No puedes advertir al dueño del servidor.', ephemeral: true });
        }
        // Verificar jerarquía de roles
        if (member.roles.highest.position >= interaction.member.roles.highest.position && interaction.user.id !== interaction.guild.ownerId) {
            return interaction.editReply({ content: 'No puedes advertir a alguien con un rol igual o superior al tuyo.', ephemeral: true });
        }

        const newWarning = warningSystem.addWarning(targetUser.id, reason, moderatorTag);

        const embed = new EmbedBuilder()
            .setColor('#FFD700') // Amarillo dorado para advertencias
            .setTitle('⚠️ Usuario Advertido')
            .setDescription(`**${targetUser.tag}** ha recibido una advertencia.`)
            .addFields(
                { name: 'Razón', value: reason },
                { name: 'Advertido por', value: moderatorTag, inline: true },
                { name: 'ID de Advertencia', value: newWarning.id, inline: true }
            )
            .setTimestamp()
            .setFooter({ text: 'Slim Shady Bot' });

        await interaction.editReply({ embeds: [embed] });

        // Opcional: Notificar al usuario advertido por DM
        try {
            const dmEmbed = new EmbedBuilder()
                .setColor('#FFD700')
                .setTitle('⚠️ Has sido Advertido')
                .setDescription(`Has recibido una advertencia en el servidor **${interaction.guild.name}**.`)
                .addFields(
                    { name: 'Razón', value: reason },
                    { name: 'Advertido por', value: moderatorTag, inline: true }
                )
                .setTimestamp()
                .setFooter({ text: 'Slim Shady Bot' });
            await targetUser.send({ embeds: [dmEmbed] });
        } catch (dmError) {
            console.error(`No se pudo enviar DM a ${targetUser.tag}:`, dmError);
        }
    },
};