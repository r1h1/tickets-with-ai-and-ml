const API_URL_BASE = 'https://supportiaml.somee.com';
const API_IA_URL_BASE = 'https://openrouter.ai/api/v1/chat/completions';

const API_IA_KEYS = [
    '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'
];

// Lista de modelos gratuitos confirmados en OpenRouter que no consumen tokens (verificá regularmente)
const IA_MODELS = [
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