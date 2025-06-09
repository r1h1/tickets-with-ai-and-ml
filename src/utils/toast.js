// Toast container y notificaciones visuales
const crearToastContainer = () => {
    if (!document.getElementById('toast-container')) {
        const toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.className = 'position-fixed top-0 start-50 translate-middle-x p-3';
        toastContainer.style.zIndex = '1100';
        document.body.appendChild(toastContainer);
    }
};

const mostrarToast = (mensaje, tipo = 'danger') => {
    crearToastContainer();
    const toastWrapper = document.createElement('div');
    toastWrapper.className = 'toast align-items-center text-white border-0 show';

    const colorMap = {
        success: 'bg-success',
        warning: 'bg-warning text-dark',
        danger: 'bg-danger',
        info: 'bg-info text-dark'
    };

    toastWrapper.classList.add(colorMap[tipo] || 'bg-secondary');

    toastWrapper.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">${mensaje}</div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
    `;

    document.getElementById('toast-container').appendChild(toastWrapper);

    setTimeout(() => {
        toastWrapper.remove();
    }, 5000);
};


export { crearToastContainer, mostrarToast };