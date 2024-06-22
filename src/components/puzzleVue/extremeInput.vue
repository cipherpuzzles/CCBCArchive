<template>
    <div class="extreme-input-wrapper" :class="{'focus-color': props.focus != ''}" :style="{outlineColor: props.focus}">
        <input :value="inputValue" @input="processInputValue" :maxlength="maxLength" class="text-html-input" />
        <div class="text-html-area" v-html="inputHtml">

        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';

interface Props {
    modelValue: string;
    baseColor?: string;
    highlightColor?: string;
    wordLength: number[];
    highlightIndex: number[];
    focus: string;
}

const props = withDefaults(defineProps<Props>(), {
    modelValue: "",
    baseColor: "#cccccc",
    highlightColor: "#e64900",
    wordLength: () => [] as number[],
    highlightIndex: () => [] as number[],
    focus: "",
});
const emit = defineEmits(["update:modelValue"]);

const renderHtml = (text: string) => {
    // highlightIndex表示第x个字符需要高亮。高亮的字符用highlightColor，其他字符用baseColor
    let html = "";
    let i = 0;
    for (let wordi = 0; wordi < props.wordLength.length; wordi++) {
        const wordLength = props.wordLength[wordi];
        for (let j = 0; j < wordLength; j++) {
            let textChar = "&nbsp;";
            if (i < text.length) {
                textChar = text[i];
            }

            if (props.highlightIndex.includes(i)) {
                html += `<span class="ei-span-token" style="color: ${props.highlightColor}; border-bottom-color: ${props.highlightColor};">${textChar}</span>`;
            } else {
                html += `<span class="ei-span-token" style="color: ${props.baseColor}; border-bottom-color: ${props.baseColor};">${textChar}</span>`;
            }
            i++;
        }

        //如果不是最后一个单词，加一个空格
        if (wordi < props.wordLength.length - 1) {
            let textChar = "&nbsp;";
            if (i < text.length) {
                textChar = text[i];
            }

            html += `<span style="color: ${props.baseColor}">${textChar}</span>`;
            i++;
        }
    }

    return html;
}

const inputValue = ref(props.modelValue);
const inputHtml = ref(renderHtml(props.modelValue));

const maxLength = computed(() => {
    // wordLength sum + count -1
    return props.wordLength.reduce((a, b) => a + b, 0) + props.wordLength.length - 1;
})

watch(() => props.modelValue, (newVal) => {
    inputValue.value = newVal;
    inputHtml.value = renderHtml(newVal);
});


const processInputValue = (event: Event) => {
    emit("update:modelValue", (event.target as HTMLInputElement).value);
}
</script>

<style lang="scss">
.ei-span-token {
    border-bottom: 1px solid #ccc;
    margin-left: 1px;
}
</style>

<style lang="scss" scoped>
.extreme-input-wrapper {
    position: relative;
    height: 40px;
    width: fit-content;
}
.focus-color {
    outline: 1px solid #ccc;
}
.text-html-input {
    position: absolute;
    left: 0;
    top: 0;
    height: 40px;
    width: 100%;
    border: none;
    outline: none;
    resize: none;
    font-size: 20px;
    padding: 5px;
    line-height: 20px;
    color: rgba(0, 0, 0, 0);
    caret-color: #ccc;
    background-color: transparent;
    font-family: "Cascadia Mono", Menlo, Monaco, "Consolas", "DejaVu Sans Mono", "Droid Sans Mono", "Lucida Console", "Inconsolata", "Courier New", Courier, monospace;
    letter-spacing: 2px;
    text-align: left;
}
.text-html-area {
    height: 40px;
    width: 100%;
    border: none;
    outline: none;
    resize: none;
    font-size: 20px;
    padding: 5px;
    line-height: 30px;
    color: #000;
    font-family: "Cascadia Mono", Menlo, Monaco, "Consolas", "DejaVu Sans Mono", "Droid Sans Mono", "Lucida Console", "Inconsolata", "Courier New", Courier, monospace;
    letter-spacing: 1px;
    overflow: auto;
    word-break: break-all;
    text-align: left;
}
</style>