// Importar rutas de APIs para hacer uso de ellas
import { ROLES_API, ROLES_GET_BY_ID_API } from '../config/constants.js';
import { showSuccess, showError, showAlert, showConfirmation } from '../utils/sweetAlert.js';
import { fetchData, fetchDataToken, sendData } from '../data/apiMethods.js';