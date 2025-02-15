<template>
    <div class="container-md">
        <div class="row header-line">
            <div class="col">
                <h4 class="title-line">{{ title }}</h4>
            </div>
        </div>
        <div class="row" v-for="contentHtml in pageHtml">
            <div class="col">
                <div v-html="contentHtml" id="contentHtml"></div>
            </div>
        </div>
        <div class="row" v-if="problemImage">
            <div class="col">
                <a :href="problemImage" target="_blank">
                    <img :src="problemImage" class="puzzle-image" />
                </a>
            </div>
        </div>
        <div v-if="puzzleType === 2" id="puzzleVue">
            <div id="puzzleVueApp"></div>
        </div>
        <div class="row" v-for="component in usedComponents">
            <div class="col">
                <light-game v-if="component.name === 'LightGame'"></light-game>
                <c12-calc v-if="component.name === 'C12Calc'"></c12-calc>
            </div>
        </div> 
        <div class="row text-dark" v-if="extendContentHtml.length > 0">
            <div class="accordion mt-4" id="ecacc">
                <div class="accordion-item">
                    <h2 class="accordion-header" id="acchead">
                        <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#acccoll">隐藏的内容（该部分内容在正确回答后可见）</button>
                    </h2>
                    <div class="accordion-collapse collapse" id="acccoll" aria-labelledby="headingOne" data-bs-parent="#ecacc">
                        <div class="accordion-body">
                            <div class="container-fluid">
                                <div class="row" v-for="eHtml in extendContentHtml">
                                    <div class="col">
                                        <div v-html="eHtml"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
        <div class="row header-line">
            <div class="col link-button-wrapper">
                <link-button v-for="link in pageButton" :link="link"></link-button>
            </div>
        </div>
    </div>
    <div class="fixed-tools">
        <div class="btn-group" role="group" aria-label="Problem Tools">
            <button class="btn btn-dark" @click="showCheckAnswer">输入答案</button>
            <button class="btn btn-dark" @click="showTips">显示提示</button>
            <button class="btn btn-dark" @click="showAnswerAnalysis">答案解析</button>
        </div>
    </div>
    <div class="modal fade" id="puzzleTips" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="puzzleTipsDialogHeader" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-fullscreen-md-down modal-lg">
            <div class="modal-content bg-dark text-light">
                <div class="modal-header">
                    <h5 class="modal-title" id="puzzleTipsDialogHeader">提示</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div class="container-fluid mt-4">
                        <div v-for="(tip, idx) in answerTips" class="mb-4">
                            <div class="d-flex justify-content-between">
                                <div>
                                    <h5>提示{{ idx + 1 }}：{{ tip.title }}</h5>
                                </div>
                                <div>
                                    <button v-if="tip.is_open" class="btn btn-secondary" @click="tip.is_open = false">隐藏</button>
                                    <button v-else class="btn btn-secondary" @click="tip.is_open = true">显示</button>
                                </div>
                            </div>
                            <div v-if="tip.is_open" v-html="tip.content_html"></div>
                        </div>
                        <div v-if="answerTips.length == 0">
                            没有提示
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">关闭</button>
                </div>
            </div>
        </div>
    </div>
    <div class="modal fade" id="answerAnalysis" tabindex="-1" aria-labelledby="answerAnalysisDialogHeader" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered modal-fullscreen-lg-down modal-xl">
            <div class="modal-content bg-dark text-light">
                <div class="modal-header">
                    <h5 class="modal-title" id="puzzleTipsDialogHeader">答案解析</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div class="container-fluid mt-4 anan-wrapper">
                        <div v-html="answerAnalysisHtml"></div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">关闭</button>
                </div>
            </div>
        </div>
    </div>
    <div class="modal fade" id="checkAnswer" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="checkAnswerDialogHeader" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-fullscreen-md-down modal-lg">
            <div class="modal-content bg-dark text-light">
                <div class="modal-header">
                    <h5 class="modal-title" id="puzzleTipsDialogHeader">输入答案</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div class="container-fluid mt-4">
                        <form @submit.prevent="checkAnswer">
                            <div class="input-group">
                                <input class="form-control bg-dark text-light" type="input" v-model="userInputAnswer" placeholder="请输入答案" />
                                <button class="btn btn-outline-success" @click="checkAnswer">提交</button>
                            </div>
                        </form>
                    </div>
                    <div v-if="showAnswerResult" class="alert mt-4" :class="[ answerTypeClass ]" role="alert" v-html="answerResult">
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">关闭</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { AdditionalAnswer, goLinkButton, PageConfigLink, ProblemTips, YamlConfig, PageComponents } from '../utils/PageConfig'
import { nextTick, Ref } from 'vue';
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import message from '../utils/message'
import GetPageConfig from '../utils/PageConfig'
import { marked } from 'marked'
import LinkButton from '../components/LinkButton.vue'
import { Collapse, Modal } from 'bootstrap';
import gBus from '../globalBus';

// Import components
import LightGame from '../components/LightGame.vue';
import C12Calc from '../components/C12Calc.vue';

// Import Vue
import puzzleVuePlugin from '../components/puzzleVue/puzzleVuePlugin';
import * as Vue from 'vue';

const route = useRoute();
const router = useRouter();

const title = ref("CCBC Archive");
const pageHtml: Ref<string[]> = ref([]);
const pageButton: Ref<PageConfigLink[]> = ref([]);
const usedComponents: Ref<PageComponents[]> = ref([]);

const problemImage: Ref<string | null> = ref(null);

interface answerTip extends ProblemTips {
    is_open: boolean;
    content_html: string;
}
const answerTips: Ref<answerTip[]> = ref([]);
const answerAnalysisHtml = ref("");

const answer = ref("");
const additionalAnswers: Ref<AdditionalAnswer[]> = ref([]);
const userInputAnswer = ref("");
const puzzleType = ref(0);

const showAnswerResult = ref(false);
const answerResult = ref("");
const answerTypeClass = ref("alert-info");

const extendContentHtml: Ref<string[]> = ref([]);
let __vue_app__: Vue.App<Element> | undefined = undefined;
let projectHome = "";
let pid = 0;

onMounted(async () => {
    const confPath = route.query.c; //confPath like: "ccbc15/problems/1/2"
    projectHome = confPath?.toString().split("/")[0] ?? "";
    console.log("Load conf:", confPath);
    if (!confPath) {
        message("danger", "无法加载页面数据");
        return;
    }

    const conf = await GetPageConfig(confPath.toString());
    initConf(conf);

    let checkAnswerDialogEl = document.getElementById("checkAnswer");
    checkAnswerDialogEl?.removeEventListener("hide.bs.modal", clearAnswerDialog);
    checkAnswerDialogEl?.addEventListener("hide.bs.modal", clearAnswerDialog);
});

function initConf(conf: YamlConfig) {
    if (conf.type !== "problem") {
        message("danger", "页面配置错误");
        return;
    }
    pid = conf.pid;
    title.value = conf.title;
    document.title = `${conf.title} - CCBC Archive`;
    pageHtml.value = conf.content.map(content => marked(content));
    puzzleType.value = conf['content-type'] ?? 0;

    if (conf['problem-image']) {
        problemImage.value = conf['problem-image'];
    }
    if (conf.links) {
        pageButton.value = conf.links;
    }
    if (conf.components) {
        usedComponents.value = conf.components;
    }
    if (conf.tips) {
        answerTips.value = conf.tips.map(tip => {
            return {
                ...tip,
                is_open: false,
                content_html: marked(tip.content)
            }
        });
    }
    if (conf['answer-analysis']) {
        answerAnalysisHtml.value = marked(conf['answer-analysis']);
    }
    answer.value = conf.answer;
    if (conf['additional-answers']) {
        additionalAnswers.value = conf['additional-answers'];
    }
    if (conf['extend-content']) {
        extendContentHtml.value = conf['extend-content'].map(content => marked(content));
    }

    // HTML 模式
    if (puzzleType.value === 1) {
        //加载附加的css和js
        nextTick(() => {
            if (conf['content-css']) {
                const cssElement = document.createElement("style");
                cssElement.innerHTML = conf['content-css'];

                const htmlContainer = document.getElementById("contentHtml");
                if (htmlContainer) {
                    htmlContainer.appendChild(cssElement);
                }
            }
            if (conf['content-js']) {
                const jsElement = document.createElement("script");
                jsElement.innerHTML = conf['content-js'];

                const htmlContainer = document.getElementById("contentHtml");
                if (htmlContainer) {
                    htmlContainer.appendChild(jsElement);
                }
            }
        });
    }
    // VUE 模式 （将script中内容视为vue组件，使用eval解析成object后插入页面中执行
    else if (puzzleType.value === 2) {
        let script = conf.vue_script ?? "";
        let html = conf.vue_template;

        let template = "";
        let style = "";

        // 从html中提取template和style
        let templateMatched = html?.match(/<template>([\s\S]+?)<\/template>/);
        if (templateMatched) {
            template = templateMatched[1];
        }
        //从 html 中提取 <style> 标签内容
        let styleMatched = html?.match(/<style.*?>([\s\S]+?)<\/style>/);
        if (styleMatched) {
            style = styleMatched[1];
        }


        nextTick(() => {
            script = script?.replace(/export default/, "return ");
            let __vue_script__ = new Function(script)();
            __vue_script__.template = template;
            __vue_app__ = Vue.createApp(__vue_script__);
            __vue_app__.use(puzzleVuePlugin);
            __vue_app__.mount("#puzzleVueApp");

            //注入style
            let puzzleAppContainer = document.getElementById("puzzleVue");
            if (!puzzleAppContainer) return;
            let styleElement = document.createElement("style");
            styleElement.innerHTML = style;
            puzzleAppContainer.appendChild(styleElement);
        });
    }
}

function showTips() {
    const tipsModal = new Modal(document.getElementById("puzzleTips")!);
    tipsModal.show();
}
function showAnswerAnalysis() {
    const aaModal = new Modal(document.getElementById("answerAnalysis")!);
    aaModal.show();
}
function showCheckAnswer() {
    const caModal = new Modal(document.getElementById("checkAnswer")!);
    caModal.show();
}

function checkAnswer() {
    let userInput = userInputAnswer.value.toLocaleLowerCase().replace(/\s+/g, "");
    let problemAnswer = answer.value.toLocaleLowerCase().replace(/\s+/g, "");

    if (userInput === problemAnswer) {
        answerResult.value = "答案正确";
        answerTypeClass.value = "alert-success";
        showAnswerResult.value = true;

        let extendCoEl = document.getElementById("acccoll");
        let extendCollapse = new Collapse(extendCoEl!);
        extendCollapse.show();
    } else {
        for (let additionalAnswer of additionalAnswers.value) {
            if (userInput === additionalAnswer.answer.toLocaleLowerCase().replace(/\s+/g, "")) {
                answerResult.value = "里程碑：" + additionalAnswer.message;
                answerTypeClass.value = "alert-warning";

                //如果有extra，则执行
                if (additionalAnswer.extra) {
                    //problemStatus的结构：{pid: {progress: {key: value}}}
                    //命令： 
                    // set key value
                    // del key
                    // clear
                    let problemStatus = JSON.parse(localStorage.getItem(`puzzleBackendStatus-${projectHome}-problemStatus`) ?? "{}");

                    let extraCommand = additionalAnswer.extra;
                    let commands = extraCommand.split(" ");
                    if (commands.length > 0) {
                        let command = commands[0];
                        if (command === "set") {
                            if (commands.length > 2) {
                                let key = commands[1];
                                let value = commands[2];
                                if (!problemStatus[pid]) {
                                    problemStatus[pid] = {};
                                }
                                if (!problemStatus[pid].progress) {
                                    problemStatus[pid].progress = {};
                                }
                                problemStatus[pid].progress[key] = value;
                            }
                        } else if (command === "del") {
                            if (commands.length > 1) {
                                let key = commands[1];
                                if (problemStatus[pid] && problemStatus[pid].progress) {
                                    delete problemStatus[pid].progress[key];
                                }
                            }
                        } else if (command === "clear") {
                            if (problemStatus[pid] && problemStatus[pid].progress) {
                                problemStatus[pid].progress = {};
                            }
                        }
                    }

                    localStorage.setItem(`puzzleBackendStatus-${projectHome}-problemStatus`, JSON.stringify(problemStatus));
                    gBus.emit("reload");
                    gBus.emit("message", {
                        type: "warning",
                        message: additionalAnswer.message
                    });
                    return;
                } else {
                    showAnswerResult.value = true;
                    return;
                }
            }
        }

        answerResult.value = "答案错误";
        answerTypeClass.value = "alert-danger";
        showAnswerResult.value = true;
    }
}

function clearAnswerDialog() {
    userInputAnswer.value = "";
    showAnswerResult.value = false;
}


function goLink(linkId: string) {
    const link = pageButton.value.find(link => link.id === linkId);
    if (link) {
        goLinkButton(link, router);
    } else {
        message("warning", "指定的链接不存在");
    }
}

window['goLink'] = goLink;
window['Vue'] = Vue;
</script>

<style lang="scss" scoped>
.puzzle-image {
    width: 100%;
}
.title-line {
    margin-top: 1.2rem;
}
.fixed-tools {
    position: fixed;
    bottom: 0;
    right: 40px;
}
</style>

<style lang="scss">
.anan-wrapper {
    img {
        width: 100%;
    }
}
</style>