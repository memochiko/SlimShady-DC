// systems/systemStateManager.js
const fs = require('node:fs');
const path = require('node:path');

// Ruta al archivo donde se guardarán los estados de los sistemas.
// Se guardará en la carpeta 'data/' en la raíz del bot.
const SYSTEM_STATES_FILE = path.join(__dirname, '..', 'data', 'system_states.json');

// Objeto para almacenar los estados de los sistemas en memoria
let systemStates = {};

// Asegura que la carpeta 'data' exista
const dataDir = path.dirname(SYSTEM_STATES_FILE);
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Carga los estados de los sistemas desde el archivo JSON al iniciar
const loadSystemStates = () => {
    if (fs.existsSync(SYSTEM_STATES_FILE)) {
        try {
            const data = fs.readFileSync(SYSTEM_STATES_FILE, 'utf8');
            systemStates = JSON.parse(data);
            console.log(`[SystemStateManager] Estados de sistemas cargados desde ${SYSTEM_STATES_FILE}.`);
        } catch (error) {
            console.error('[SystemStateManager] Error al cargar estados de sistemas (posible JSON inválido). Iniciando con estados vacíos:', error);
            systemStates = {}; // Restablecer si hay un error de parseo
        }
    } else {
        console.log(`[SystemStateManager] Archivo de estados de sistemas no encontrado: ${SYSTEM_STATES_FILE}. Iniciando con estados vacíos.`);
    }
};

// Guarda los estados de los sistemas en el archivo JSON
const saveSystemStates = () => {
    try {
        fs.writeFileSync(SYSTEM_STATES_FILE, JSON.stringify(systemStates, null, 2), 'utf8');
        console.log(`[SystemStateManager] Estados de sistemas guardados en ${SYSTEM_STATES_FILE}.`);
    } catch (error) {
        console.error('[SystemStateManager] Error al guardar estados de sistemas:', error);
    }
};

// Carga inicial de los estados al cargar el módulo
loadSystemStates();

module.exports = {
    /**
     * Obtiene el estado (on/off) de un sistema.
     * @param {string} systemName - El nombre del sistema (ej. 'welcome', 'farewell', 'boost').
     * @returns {boolean} True si el sistema está activado, false si está desactivado o no configurado.
     */
    getState: (systemName) => {
        // Por defecto, si un sistema no está en la configuración, se considera activado.
        return systemStates[systemName.toLowerCase()] !== false;
    },

    /**
     * Establece el estado (on/off) de un sistema y lo guarda.
     * @param {string} systemName - El nombre del sistema.
     * @param {boolean} state - True para activar, false para desactivar.
     */
    setState: (systemName, state) => {
        systemStates[systemName.toLowerCase()] = state;
        saveSystemStates(); // Guarda los cambios
    },

    /**
     * Obtiene todos los estados de los sistemas configurados.
     * @returns {object} Un objeto con los nombres de los sistemas y sus estados.
     */
    getAllStates: () => {
        return { ...systemStates }; // Devuelve una copia para evitar modificaciones directas
    }
};
