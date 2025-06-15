const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('avatar')
        .setDescription('Muestra el avatar de un usuario o el tuyo.')
        .addUserOption(option =>
            option.setName('usuario')
                .setDescription('El usuario del que quieres obtener el avatar.')
                .setRequired(false)),
    async execute(interaction) {
        const user = interaction.options.getUser('usuario') || interaction.user;

        const embed = new EmbedBuilder()
            .setColor('#9b59b6')
            .setTitle(`🖼️ Avatar de ${user.username}`)
            .setImage(user.displayAvatarURL({ dynamic: true, size: 1024 }))
            .setTimestamp()
            .setFooter({ text: 'Slim Shady Bot' });

        await interaction.reply({ embeds: [embed] });
    },
};