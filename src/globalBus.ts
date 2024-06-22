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

export type MessageType = 'success' | 'info' | 'warning' | 'danger' | 'primary' | 'secondary' | 'dark' | 'light';

type GlobalEventMessageType = {
    'show-error': string;
    'redirect-location': {
        location: string;
        message: string;
    };
    'log-out': {
        message: string;
    };
    'message': {
        message: string;
        type: MessageType;
    };
    'notify-message': {
        title: string;
        content: string;
        type: MessageType;
        time: number;
    };
    'puzzle-reload': void;
}

export const globalBus = mitt<GlobalEventMessageType>();

export default gBus;