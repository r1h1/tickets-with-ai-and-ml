// Constante para consumo de APIs para support ia ml
const API_URL_BASE = 'https://iamlsupportsystem.somee.com/';

// AUTH
const AUTH_API = `${API_URL_BASE}/tickets/v1/Auth`;
const AUTH_LOGIN_API = `${AUTH_API}/Login`;
const AUTH_REGISTRAR_API = `${AUTH_API}/Registrar`;
const AUTH_CAMBIAR_CLAVE_API = `${AUTH_API}/CambiarClave`;
const AUTH_VALIDAR_TOKEN_API = `${AUTH_API}/ValidarToken`;

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



// Constante para consumo de API openrouter IA / ML
const API_IA_URL_BASE = 'https://openrouter.ai/api/v1/chat/completions';
const API_IA_KEYS = [
    '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',
    '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'
];

// Modelos gratuitos confirmados, multilingües y con buen soporte para español
const IA_MODELS = [
    'meta-llama/llama-4-scout:free', //funciona
    'mistralai/mistral-small-3.1-24b-instruct:free', //funciona
    'deepseek/deepseek-r1:free', //funciona
    'nousresearch/deephermes-3-mistral-24b-preview:free', //funciona
    'opengvlab/internvl3-14b:free', //funciona
    'deepseek/deepseek-prover-v2:free' //funciona
];

export {
    API_URL_BASE,
    AUTH_API,
    AUTH_LOGIN_API,
    AUTH_REGISTRAR_API,
    AUTH_CAMBIAR_CLAVE_API,
    AUTH_VALIDAR_TOKEN_API,
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
    IA_MODELS
};