import gBus from "../globalBus";
import type { ToastMessageData } from "../globalBus";

export default function message(type: ToastMessageData["type"], message: string) {
    gBus.emit("message", {
        type,
        message
    });
}

export function reload() {
    gBus.emit("reload");
}