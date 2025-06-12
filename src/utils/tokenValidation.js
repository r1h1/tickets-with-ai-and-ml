// Importar API para auth token
import { AUTH_VALIDAR_TOKEN_API } from '../config/constants.js';
import { fetchDataToken } from '../data/apiMethods.js';

const verificarToken = async (token) => {
    if (!token) {
        console.warn("Token no encontrado.");
        await delayLoader(false);
        return false;
    }

    try {
        const data = await fetchDataToken(AUTH_VALIDAR_TOKEN_API, "GET", {
            "Authorization": `Bearer ${token}`,
            "Accept": "application/json"
        });

        const valido = data.code === 200 && data.message === "Token válido.";
        await delayLoader(valido);
        return valido;

    } catch (error) {
        console.error("Error en la validación del token:", error);
        await delayLoader(false);
        return false;
    }
};

// Función para manejar el loader con x segundos
const delayLoader = (tokenValido) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            if (tokenValido) {
                document.getElementById("loader").style.display = "none";
                document.getElementById("content").style.display = "block";
            } else {
                document.getElementById("loader").style.display = "block";
                document.getElementById("content").style.display = "none";
            }
            resolve();
        }, 100); // mili segundos
    });
};

export { verificarToken };