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
                    <div v-if="showAnswerResult" class="alert mt-4" :class="[ answerTypeClass ]" role="alert">
                        {{ answerResult }}
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
import { AdditionalAnswer, goLinkButton, PageConfigLink, ProblemTips, YamlConfig } from '../utils/PageConfig'
import { nextTick, Ref } from 'vue';
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import message from '../utils/message'
import GetPageConfig from '../utils/PageConfig'
import { marked } from 'marked'
import LinkButton from '../components/LinkButton.vue'
import { Collapse, Modal } from 'bootstrap';

const route = useRoute();
const router = useRouter();

const title = ref("CCBC Archive");
const pageHtml: Ref<string[]> = ref([]);
const pageButton: Ref<PageConfigLink[]> = ref([]);

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

const showAnswerResult = ref(false);
const answerResult = ref("");
const answerTypeClass = ref("alert-info");

const extendContentHtml: Ref<string[]> = ref([]);

onMounted(async () => {
    const confPath = route.query.c;
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
    title.value = conf.title;
    document.title = `${conf.title} - CCBC Archive`;
    pageHtml.value = conf.content.map(content => marked(content));

    if (conf['problem-image']) {
        problemImage.value = conf['problem-image'];
    }
    if (conf.links) {
        pageButton.value = conf.links;
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
                answerResult.value = "答案错误，但是获得了附加信息：" + additionalAnswer.message;
                answerTypeClass.value = "alert-danger";
                showAnswerResult.value = true;
                return;
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