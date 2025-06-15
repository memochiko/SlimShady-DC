const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ship')
        .setDescription('Calcula el porcentaje de "shippeo" entre dos usuarios.')
        .addUserOption(option =>
            option.setName('usuario1')
                .setDescription('El primer usuario.')
                .setRequired(true))
        .addUserOption(option =>
            option.setName('usuario2')
                .setDescription('El segundo usuario.')
                .setRequired(true)),
    async execute(interaction) {
        const user1 = interaction.options.getUser('usuario1');
        const user2 = interaction.options.getUser('usuario2');

        if (user1.id === user2.id) {
            return interaction.reply({ content: '¡No puedes shippearte contigo mismo! (O quizás sí, pero es raro)', ephemeral: true });
        }

        // Genera un porcentaje aleatorio, pero constante para el mismo par de usuarios
        const ids = [user1.id, user2.id].sort(); // Ordenar para que el resultado sea consistente
        let seed = 0;
        for (const id of ids) {
            for (let i = 0; i < id.length; i++) {
                seed += id.charCodeAt(i);
            }
        }
        const percentage = (seed * 13579 % 101); // Número aleatorio entre 0 y 100

        let message;
        if (percentage < 10) message = '¡Ni en un millón de años!';
        else if (percentage < 30) message = 'No parece haber chispa.';
        else if (percentage < 50) message = 'Podrían ser amigos... o no.';
        else if (percentage < 70) message = '¡Podría funcionar! Dale una oportunidad.';
        else if (percentage < 90) message = '¡Definitivamente hay algo entre ellos!';
        else message = '💖 ¡Hecho en el cielo! ¡Una pareja perfecta!';

        const embed = new EmbedBuilder()
            .setColor('#FFC0CB') // Rosa claro
            .setTitle('💕 Medidor de Shippeo')
            .setDescription(`La conexión entre **${user1.username}** y **${user2.username}** es...`)
            .addFields(
                { name: 'Resultado', value: `**${percentage}%**` },
                { name: 'Mensaje de Slim Shaidy', value: message }
            )
            .setThumbnail('https://cdn-icons-png.flaticon.com/512/107/107770.png') // Corazón
            .setTimestamp()
            .setFooter({ text: 'Slim Shaidy Bot | Seran..? 😉' });

        await interaction.reply({ embeds: [embed] });
    },
};