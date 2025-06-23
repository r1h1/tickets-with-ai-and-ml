// ============================
// API BASES
// ============================
const API_URL_BASE = 'https://iamlsupportsystem.somee.com';

// AUTH
const AUTH_API = `${API_URL_BASE}/tickets/v1/Auth`;
const AUTH_LOGIN_API = `${AUTH_API}/Login`;
const AUTH_REGISTRAR_API = `${AUTH_API}/Registrar`;
const AUTH_CAMBIAR_CLAVE_API = `${AUTH_API}/CambiarClave`;
const AUTH_VALIDAR_TOKEN_API = `${AUTH_API}/ValidarToken`;
const AUTH_LOGIC_DELETE = `${AUTH_API}/LogicDelete`;

// CATEGORY
const CATEGORY_API = `${API_URL_BASE}/tickets/v1/Category`;
const CATEGORY_GET_BY_ID_API = (id) => `${CATEGORY_API}/${id}`;

// CHATLOG
const CHATLOG_API = `${API_URL_BASE}/tickets/v1/ChatLog`;
const CHATLOG_GET_BY_ID_API = (id) => `${CHATLOG_API}/${id}`;

// LLM CONFIG
const LLMCONFIG_API = `${API_URL_BASE}/tickets/v1/LLMConfig`;
const LLMCONFIG_GET_BY_ID_API = (id) => `${LLMCONFIG_API}/${id}`;
const LLMCONFIG_LAST_USED_API = (id) => `${LLMCONFIG_API}/last-used/${id}`;

// ROLES
const ROLES_API = `${API_URL_BASE}/tickets/v1/Roles`;
const ROLES_GET_BY_ID_API = (id) => `${ROLES_API}/${id}`;

// TICKETS
const TICKETS_API = `${API_URL_BASE}/tickets/v1/Tickets`;
const TICKETS_GET_BY_ID_API = (id) => `${TICKETS_API}/${id}`;

// USERS
const USERS_API = `${API_URL_BASE}/tickets/v1/Users`;
const USERS_GET_BY_ID_API = (id) => `${USERS_API}/${id}`;

// OPENROUTER IA CHAT
const API_IA_URL_BASE = 'https://openrouter.ai/api/v1/chat/completions';

// IMPORTS
import { fetchData } from '../data/apiMethods.js';

// OBTENER HEADERS CON EL TOKEN
const obtainHeaders = () => {
    const token = sessionStorage.getItem("token");
    if (!token) {
        console.warn("No hay token, redirigiendo a login...");
        window.location.href = "../../../index.html";
        return null;
    }
    return { "Authorization": `Bearer ${token}` };
};

// OBTENER CONFIGURACIONES DE IA
const obtainIAModelsAndApiKeys = async () => {
    try {
        const response = await fetchData(LLMCONFIG_API, "GET", obtainHeaders);

        if (response?.success && Array.isArray(response.data)) {
            const activeModels = response.data.filter(item => item.isActive);

            const models = activeModels.map(item => item.modelName);
            const apiKeys = [...new Set(activeModels.map(item => item.apiKey))]; // evita repetidos

            return { models, apiKeys };
        } else {
            console.warn("No se pudieron obtener modelos IA:", response?.message);
            return { models: [], apiKeys: [] };
        }

    } catch (error) {
        console.error("Error al obtener configuraciones IA:", error);
        return { models: [], apiKeys: [] };
    }
}

// ARREGLOS DINAMICOS PARA ENVIAR LOS MODELOS Y LAS API KEYS
let IA_MODELS = [];
let API_IA_KEYS = [];

(async function initializeIAConfig() {
    const { models, apiKeys } = await obtainIAModelsAndApiKeys();
    IA_MODELS = models;
    API_IA_KEYS = apiKeys;
    console.log("Modelos IA cargados.");
})();


// EXPORTAR CONFIGURACIONES
export {
    API_URL_BASE,
    AUTH_API,
    AUTH_LOGIN_API,
    AUTH_REGISTRAR_API,
    AUTH_CAMBIAR_CLAVE_API,
    AUTH_VALIDAR_TOKEN_API,
    AUTH_LOGIC_DELETE,
    CATEGORY_API,
    CATEGORY_GET_BY_ID_API,
    CHATLOG_API,
    CHATLOG_GET_BY_ID_API,
    LLMCONFIG_API,
    LLMCONFIG_GET_BY_ID_API,
    LLMCONFIG_LAST_USED_API,
    ROLES_API,
    ROLES_GET_BY_ID_API,
    TICKETS_API,
    TICKETS_GET_BY_ID_API,
    USERS_API,
    USERS_GET_BY_ID_API,
    API_IA_URL_BASE,
    API_IA_KEYS,
    IA_MODELS,
    obtainIAModelsAndApiKeys
};