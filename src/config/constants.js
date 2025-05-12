// Constante para consumo de APIs para support ia ml
const API_URL_BASE = 'https://supportiaml.somee.com';

// Constante para consumo de API openrouter IA / ML
const API_IA_URL_BASE = 'https://openrouter.ai/api/v1/chat/completions';
const API_IA_KEYS = [
    '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',
    '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'
];

// Modelos gratuitos confirmados, multilingües y con buen soporte para español
const IA_MODELS = [
    'meta-llama/llama-4-maverick:free',
    'meta-llama/llama-4-scout:free',
    'mistralai/mistral-small-3.1-24b-instruct:free',
    'deepseek/deepseek-r1:free',
    'nousresearch/deephermes-3-mistral-24b-preview:free',
    'opengvlab/internvl3-14b:free',
    'deepseek/deepseek-prover-v2:free'
];

export {
    API_URL_BASE,
    API_IA_URL_BASE,
    API_IA_KEYS,
    IA_MODELS
};