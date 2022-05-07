import mitt from 'mitt'

export interface ToastMessageData {
    message: string;
    type: "success" | "info" | "warning" | "danger";
}

type EventMessageType = {
    message: ToastMessageData,
    reload: void,
}

const gBus = mitt<EventMessageType>();

export default gBus;