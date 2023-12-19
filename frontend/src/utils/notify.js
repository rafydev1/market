import { toast } from 'react-toastify';

export const showNotify = (message, autoClose, type) => {
    toast(message, { position: "bottom-right", type, autoClose });
};