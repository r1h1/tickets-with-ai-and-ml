import {
    API_IA_URL_BASE,
    API_IA_KEYS,
    IA_MODELS
} from "../config/constants.js";
import { IA_PROMPT_BASE } from "../config/prompts.js";
import { fetchData, fetchDataToken, sendData } from '../data/apiMethods.js';

// Round robin para keys
let currentKeyIndex = parseInt(sessionStorage.getItem('apiKeyIndex')) || 0;

function getNextApiKey() {
    const key = API_IA_KEYS[currentKeyIndex];
    currentKeyIndex = (currentKeyIndex + 1) % API_IA_KEYS.length;
    sessionStorage.setItem('apiKeyIndex', currentKeyIndex);
    return key;
}

// Round robin para modelos IA
let currentModelIndex = parseInt(sessionStorage.getItem('modelIndex')) || 0;

function getNextModel() {
    const model = IA_MODELS[currentModelIndex];
    currentModelIndex = (currentModelIndex + 1) % IA_MODELS.length;
    sessionStorage.setItem('modelIndex', currentModelIndex);
    return model;
}

const palabrasClaveTecnicas = [
    'windows', 'linux', 'mac', 'pantalla', 'ip', 'red', 'conexión', 'driver', 'actualización',
    'formateo', 'wifi', 'error', 'teclado', 'monitor', 'impresora', 'puerto', 'router',
    'audio', 'altavoz', 'compu', 'computadora', 'teléfono', 'android', 'ios', 'soporte',
    'internet', 'mouse', 'sistema', 'operativo', 'firewall', 'antivirus', 'procesador',
    'memoria', 'ram', 'disco', 'bios', 'usb', 'ethernet', 'vpn', 'ping', 'proxy',
    'chrome', 'firefox', 'safari', 'bluetooth', 'login', 'sesión', 'seguridad', 'virus',
    'phishing', 'spyware', 'software', 'hardware', 'bios', 'actualizar', 'touch', 'solucionar',
    'gestionar', 'update', 'bocina', 'proyecto', 'lenguaje', 'hora', 'ssd', 'navegador',
    'web', 'whatsapp', 'pc', 'virtual', 'virtualizar', 'ubuntu', 'boot', 'espacio', 'almacenamiento',
    'cargador', 'datos', 'empresarial', 'no funciona', 'problema', 'clavo', 'apoyo', 'support'
];

export function contienePalabraTecnica(texto) {
    return palabrasClaveTecnicas.some(p => texto.toLowerCase().includes(p));
}

export async function consultarBotIA(mensaje) {
    const body = {
        model: getNextModel(),
        messages: [
            { role: 'system', content: IA_PROMPT_BASE.supportBot },
            { role: 'user', content: mensaje }
        ]
    };

    const headers = {
        'Authorization': `Bearer ${getNextApiKey()}`,
        'Content-Type': 'application/json'
    };

    try {
        const res = await fetch(API_IA_URL_BASE, {
            method: 'POST',
            headers,
            body: JSON.stringify(body)
        });

        const data = await res.json();

        if (data.error) {
            sessionStorage.removeItem("contadorMensajes");
            console.warn("Bot IA desactivado temporalmente:", data.error.message);
            return "El bot no pudo comunicarse. Intenta nuevamente con la misma pregunta o crea un ticket y un agente humano te atenderá.";
        }

        return data.choices?.[0]?.message?.content || "Sin respuesta de IA.";
    } catch (error) {
        return "No se pudo utilizar el bot por un error inesperado.";
    }
}

export async function clasificarTicketIA(asunto, descripcion) {
    const promptData = structuredClone(IA_PROMPT_BASE.ticket_classifier);
    promptData.ticket_actual.asunto = asunto;
    promptData.ticket_actual.descripcion = descripcion;

    const body = {
        model: getNextModel(),
        messages: [
            { role: 'user', content: JSON.stringify(promptData) }
        ]
    };

    const headers = {
        'Authorization': `Bearer ${getNextApiKey()}`,
        'Content-Type': 'application/json'
    };

    try {
        const res = await fetch(API_IA_URL_BASE, {
            method: 'POST',
            headers,
            body: JSON.stringify(body)
        });

        const data = await res.json();

        if (data.error) {
            const fallback = {
                prioridad: "media",
                categoria: "sin_clasificar",
                agente_sugerido: "soporte junior",
                razonamiento: "El modelo de IA no respondió. Resolver manualmente.",
                solucion: ["Modelo de IA dejó de funcionar. Resolver manualmente."],
                keywords_detectadas: []
            };
            sessionStorage.setItem("ticketClasificado", JSON.stringify(fallback));
            return fallback;
        }

        const respuesta = data.choices?.[0]?.message?.content || "{}";
        const textoLimpio = respuesta
            .replace(/```json/g, '')
            .replace(/```/g, '')
            .replace(/\\n/g, '')
            .replace(/\n/g, '')
            .replace(/\t/g, '')
            .replace(/[\r]/g, '')
            .trim();

        const jsonResult = JSON.parse(textoLimpio);
        sessionStorage.setItem("ticketClasificado", JSON.stringify(jsonResult));
        return jsonResult;

    } catch (e) {
        const fallback = {
            prioridad: "media",
            categoria: "sin_clasificar",
            agente_sugerido: "soporte junior",
            razonamiento: "Error inesperado en la petición IA. Resolver manualmente.",
            solucion: ["No se pudo contactar al clasificador IA. Resolver manualmente."],
            keywords_detectadas: []
        };
        sessionStorage.setItem("ticketClasificado", JSON.stringify(fallback));
        return fallback;
    }
}