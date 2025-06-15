const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');
const config = require('../config.js'); // Asegúrate de tener tu API Key en config.js

module.exports = {
    data: new SlashCommandBuilder()
        .setName('translate')
        .setDescription('Traduce un texto a un idioma específico (ej. "en" para inglés, "es" para español).')
        .addStringOption(option =>
            option.setName('texto')
                .setDescription('El texto a traducir.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('idioma_destino')
                .setDescription('El código del idioma al que traducir (ej. "en", "es", "fr").')
                .setRequired(true)),
    async execute(interaction) {
        const text = interaction.options.getString('texto');
        const targetLanguage = interaction.options.getString('idioma_destino').toLowerCase();
        // Para Google Translate API, necesitarías una API Key y un setup más complejo.
        // Aquí se usa una API de traducción gratuita y sencilla (para propósitos de demostración).
        // En producción, considera usar servicios robustos como Google Translate API o DeepL.

        // Esta es una API de ejemplo gratuita, puede tener límites y no ser tan precisa como otras.
        // REQUIERE CAMBIAR ESTO POR UNA API REAL EN PRODUCCIÓN.
        const apiUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=auto|${targetLanguage}`;

        await interaction.deferReply();

        try {
            const response = await fetch(apiUrl);
            const data = await response.json();

            if (data.responseStatus !== 200 || !data.responseData || !data.responseData.translatedText) {
                console.error('Error en la respuesta de la API de traducción:', data);
                return interaction.editReply('No pude traducir el texto. Asegúrate de que el idioma de destino es válido (ej. `en`, `es`, `fr`).');
            }

            const translatedText = data.responseData.translatedText;
            const detectedLanguage = data.responseData.detectedLanguage || 'Desconocido';

            const embed = new EmbedBuilder()
                .setColor('#8e44ad')
                .setTitle('🌍 Traductor')
                .addFields(
                    { name: 'Texto Original', value: text },
                    { name: `Traducido a ${targetLanguage.toUpperCase()} (detectado: ${detectedLanguage})`, value: translatedText }
                )
                .setTimestamp()
                .setFooter({ text: 'Slim Shaidy Bot | Fuente: MyMemory API (ejemplo)' }); // Adapta la fuente si usas otra API

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error('Error al traducir texto:', error);
            await interaction.editReply('Hubo un error al intentar traducir el texto. Intenta de nuevo más tarde.');
        }
    },
};