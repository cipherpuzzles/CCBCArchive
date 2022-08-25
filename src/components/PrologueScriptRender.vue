<template>
    <div class="script-wrapper" @click="scriptDoNextStep" @keyup.enter="scriptDoNextStep" @keyup.space="scriptDoNextStep">
        <div v-for="l in screenLines">
            <p v-if="l.type == 'default'" style="color: #FFFFFF">{{ l.content }}</p>
            <p v-if="l.type == 'player'" style="color: #326CFF">{{ l.content }}</p>
            <p v-if="l.type == 'convenor'" style="color: #F561A4">{{ l.content }}</p>
            <p v-if="l.type == 'jump'" class="text-center">
                <button class="btn btn-primary" @click="goNext" style="font-size: 24px">{{ l.content }}</button>
            </p>
            <p v-if="l.type == 'jump-main'" class="text-center">
                <img @click="goNext" class="jump-main-img" :src="l.content">
            </p>
        </div>
        <div class="text-center next-icon" v-if="rn < scriptLines.length && currentTimer === 0">
            <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" fill="currentColor" class="bi bi-caret-down-fill" viewBox="0 0 16 16">
                <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z"/>
            </svg>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.script-wrapper {
    width: 100%;
    min-height: 600px;
    font-size: 22px;
    cursor: pointer;
    ::selection {
        background: rgba(0, 0, 0, 0.1);
    }
}
.next-icon {
    color: #32b491;
    animation: bounce-up-down 1.5s ease-in-out infinite;
}

@keyframes bounce-up-down {
    0% {
        transform: translateY(0);
    }
    50% {
        transform: translateY(-10px);
    }
    100% {
        transform: translateY(0);
    }
}

.jump-main-img {
    width: 100%;
    max-width: 840px;
}
</style>

<script setup lang="ts">
import { onMounted, reactive, ref, toRefs, watch } from "vue";

const props = defineProps({
    script: String,
});

const { script } = toRefs(props);
const scriptLines = ref<ScriptLine[]>([]);
const screenLines = ref<ScriptLine[]>([]);

const rn = ref(0);
const currentTimer = ref(0);

let currentLine: ScriptLine;

// watch(script!, (newV, oldV) => {
//     if (newV != oldV) {
//         scriptLines.value = parseScript(newV);
//         init();
//     }
// });
onMounted(() => {
    if (script) {
        scriptLines.value = parseScript(script.value);
        init();
    }
});

function init() {
    rn.value = 0; // reset
    scriptDoNextStep();
}

function scriptDoNextStep() {
    if (rn.value >= scriptLines.value.length) {
        return;
    }

    let line = scriptLines.value[rn.value];

    if (line.type == "comment") {
        rn.value++;
        scriptDoNextStep();
        return;
    } else if (line.type == "return") {
        screenLines.value = [];
        rn.value++;
        scriptDoNextStep();
        return;
    }

    if (currentTimer.value !== 0) {
        clearInterval(currentTimer.value);
        currentTimer.value = 0;
        currentLine.content = line.content;
        rn.value++;
    } else {
        currentLine = reactive({
            type: line.type,
            content: ""
        });

        screenLines.value.push(currentLine);

        currentTimer.value = window.setInterval(() => {
            if (!line.content) {
                clearInterval(currentTimer.value);
                currentTimer.value = 0;
                rn.value++;
                return;
            }

            if (!currentLine.content) {
                currentLine.content = "";
            }

            currentLine.content += line.content[currentLine.content.length];
            if (currentLine.content.length >= line.content.length) {
                clearInterval(currentTimer.value);
                currentTimer.value = 0;
                rn.value++;
            }
        }, 100);
    }
}

interface ScriptLine {
    type: "default" | "player" | "convenor" | "return" | "jump" | "jump-main" | "comment";
    content?: string;
}

function parseScript(script?: string) {
    let result: ScriptLine[] = [];

    if (!script) {
        return result;
    }

    let lines = script.split("\n");
    for (let line of lines) {
        if (line.startsWith("#")) {
            result.push({
                type: "comment",
                content: line.substring(1),
            });
        } else if (line.startsWith("P|")) {
            result.push({
                type: "player",
                content: line.substring(2),
            });
        } else if (line.startsWith("C|")) {
            result.push({
                type: "convenor",
                content: line.substring(2),
            });
        } else if (line.startsWith("R|")) {
            result.push({
                type: "return",
                content: line.substring(2),
            });
        } else if (line.startsWith("J|")) {
            result.push({
                type: "jump",
                content: line.substring(2),
            });
        } else if (line.startsWith("JM|")) {
            result.push({
                type: "jump-main",
                content: line.substring(3),
            });
        } else if (line.startsWith("D|")) {
            result.push({
                type: "default",
                content: line.substring(2),
            });
        }
    }
    return result;
}

const emit = defineEmits<{(e: 'next', value: object): void}>();

function goNext() {
    emit('next', {});
}
</script>