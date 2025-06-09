// Importar rutas de APIs para hacer uso de ellas
import { USERS_API, USERS_GET_BY_ID_API } from '../config/constants.js';
import { showSuccess, showError, showAlert, showConfirmation } from '../utils/sweetAlert.js';

// Importar métodos para enviar traer info de apis
import { fetchData, fetchDataToken, sendData } from '../data/apiMethods.js';