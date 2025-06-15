const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');
const config = require('../config.js'); // Asegúrate de tener tu API Key en config.js

module.exports = {
    data: new SlashCommandBuilder()
        .setName('weather')
        .setDescription('Muestra el clima actual de una ciudad.')
        .addStringOption(option =>
            option.setName('ciudad')
                .setDescription('El nombre de la ciudad.')
                .setRequired(true)),
    async execute(interaction) {
        const city = interaction.options.getString('ciudad');
        const apiKey = config.weatherApiKey; // Necesitarás una API Key de OpenWeatherMap u otro servicio

        if (!apiKey) {
            return interaction.reply({ content: 'El comando de clima no está configurado. Por favor, pide al propietario del bot que añada una API Key de clima en `config.js`.', ephemeral: true });
        }

        await interaction.deferReply();

        try {
            const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&lang=es&appid=${apiKey}`;
            const response = await fetch(url);
            const data = await response.json();

            if (data.cod !== 200) {
                return interaction.editReply(`No pude encontrar el clima para "${city}". Asegúrate de que el nombre de la ciudad es correcto.`);
            }

            const { name, main, weather, wind } = data;
            const temp = main.temp;
            const feelsLike = main.feels_like;
            const humidity = main.humidity;
            const description = weather[0].description;
            const icon = weather[0].icon;
            const windSpeed = wind.speed;

            const embed = new EmbedBuilder()
                .setColor('#f39c12')
                .setTitle(`☀️ Clima en ${name}`)
                .setThumbnail(`http://openweathermap.org/img/wn/${icon}@2x.png`)
                .addFields(
                    { name: 'Temperatura', value: `${temp}°C`, inline: true },
                    { name: 'Sensación Térmica', value: `${feelsLike}°C`, inline: true },
                    { name: 'Humedad', value: `${humidity}%`, inline: true },
                    { name: 'Condición', value: description.charAt(0).toUpperCase() + description.slice(1), inline: true },
                    { name: 'Velocidad del Viento', value: `${windSpeed} m/s`, inline: true }
                )
                .setTimestamp()
                .setFooter({ text: 'Slim Shaidy Bot | Fuente: OpenWeatherMap' });

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error('Error al obtener el clima:', error);
            await interaction.editReply('Hubo un error al intentar obtener el clima. Intenta de nuevo más tarde.');
        }
    },
};