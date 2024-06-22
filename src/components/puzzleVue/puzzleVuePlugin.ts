import { Plugin } from 'vue';
import adjustTextColor from '../../utils/adjustTextColor';
import { formatTimestamp } from '../../utils/formatDate';
import markdownToHtml from '../../utils/markdown';
import sleep from '../../utils/sleep';
import { globalBus } from '../../globalBus';
import RoleBadge from '../roleBadge.vue';
import extremeInput from './extremeInput.vue';

const puzzleVuePlugin: Plugin = {
    install(app) {
        app.provide('api', () => { console.error("api func not supported in archive player.") });
        app.provide('defaultApiErrorAction', () => { console.error("defaultApiErrorAction func not supported in archive player.") });
        app.provide('ysync', () => { console.error("ysync func not supported in archive player.") });
        app.provide('adjustTextColor', adjustTextColor);
        app.provide('formatTimestamp', formatTimestamp);
        app.provide('markdownToHtml', markdownToHtml);
        app.provide('sleep', sleep);
        app.provide('globalBus', globalBus);
        app.component('role-badge', RoleBadge);
        app.component('extreme-input', extremeInput);
        app.component('three', () => { console.error("three func not supported in archive player.") });
    }
}

export default puzzleVuePlugin;