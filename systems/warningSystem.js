// systems/warningSystem.js
const fs = require('node:fs');
const path = require('node:path');

// Ruta al archivo donde se guardarán las advertencias.
// Se guardará en la carpeta 'data/' en la raíz del bot.
const WARNINGS_FILE = path.join(__dirname, '..', 'data', 'warnings.json');

// Un Map para almacenar las advertencias en memoria (clave: userId, valor: array de advertencias)
let userWarnings = new Map();

// Asegura que la carpeta 'data' exista
const dataDir = path.dirname(WARNINGS_FILE);
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Carga las advertencias desde el archivo JSON al iniciar el bot
const loadWarnings = () => {
    if (fs.existsSync(WARNINGS_FILE)) {
        try {
            const data = fs.readFileSync(WARNINGS_FILE, 'utf8');
            const parsedData = JSON.parse(data);
            // Convierte el objeto plano leído del JSON de nuevo a un Map
            userWarnings = new Map(parsedData);
            console.log(`[WarningSystem] Advertencias cargadas desde ${WARNINGS_FILE}. Total de usuarios con advertencias: ${userWarnings.size}`);
        } catch (error) {
            console.error('[WarningSystem] Error al cargar advertencias (posible JSON inválido). Iniciando con advertencias vacías:', error);
            userWarnings = new Map(); // Restablecer si hay un error de parseo o el contenido no es un array
        }
    } else {
        console.log(`[WarningSystem] Archivo de advertencias no encontrado: ${WARNINGS_FILE}. Iniciando con advertencias vacías.`);
    }
};

// Guarda las advertencias en el archivo JSON
const saveWarnings = () => {
    try {
        // Convierte el Map a un array de arrays para la serialización a JSON
        fs.writeFileSync(WARNINGS_FILE, JSON.stringify(Array.from(userWarnings), null, 2), 'utf8');
        console.log(`[WarningSystem] Advertencias guardadas en ${WARNINGS_FILE}.`);
    } catch (error) {
        console.error('[WarningSystem] Error al guardar advertencias:', error);
    }
};

// Ejecuta la carga inicial de advertencias al cargar el módulo
loadWarnings();

module.exports = {
    /**
     * Añade una advertencia a un usuario.
     * @param {string} userId - El ID del usuario.
     * @param {string} reason - La razón de la advertencia.
     * @param {string} moderatorTag - El tag del moderador que emitió la advertencia.
     * @returns {object} La advertencia recién añadida.
     */
    addWarning: (userId, reason, moderatorTag) => {
        if (!userWarnings.has(userId)) {
            userWarnings.set(userId, []);
        }
        const warnings = userWarnings.get(userId);
        const warning = {
            id: Date.now().toString(), // ID simple basado en el timestamp para unicidad
            reason: reason,
            timestamp: new Date().toISOString(), // Fecha y hora en formato ISO
            moderator: moderatorTag
        };
        warnings.push(warning);
        saveWarnings(); // Guarda los cambios después de añadir
        return warning;
    },

    /**
     * Obtiene todas las advertencias de un usuario.
     * @param {string} userId - El ID del usuario.
     * @returns {Array<object>} Un array de objetos de advertencia. Retorna un array vacío si no hay advertencias.
     */
    getWarnings: (userId) => {
        return userWarnings.get(userId) || [];
    },

    /**
     * Elimina una advertencia específica de un usuario por su ID de advertencia.
     * @param {string} userId - El ID del usuario.
     * @param {string} warningId - El ID de la advertencia a eliminar.
     * @returns {boolean} True si la advertencia fue eliminada, false de lo contrario.
     */
    removeWarning: (userId, warningId) => {
        if (!userWarnings.has(userId)) {
            return false;
        }
        const warnings = userWarnings.get(userId);
        const initialLength = warnings.length;
        userWarnings.set(userId, warnings.filter(w => w.id !== warningId));
        if (userWarnings.get(userId).length < initialLength) {
            saveWarnings(); // Guarda los cambios después de eliminar
            return true;
        }
        return false;
    },

    /**
     * Elimina todas las advertencias de un usuario.
     * @param {string} userId - El ID del usuario.
     * @returns {boolean} True si las advertencias fueron eliminadas, false de lo contrario.
     */
    clearWarnings: (userId) => {
        if (userWarnings.has(userId)) {
            userWarnings.delete(userId);
            saveWarnings(); // Guarda los cambios después de limpiar
            return true;
        }
        return false;
    }
};