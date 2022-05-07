<template>
    <div class="container-md">
        <div class="row header-line center">
            <div class="col">
                <h1>{{ title }}</h1>
            </div>
        </div>
        <div class="row" v-for="contentHtml in pageHtml">
            <div class="col">
                <div v-html="contentHtml" id="contentHtml"></div>
            </div>
        </div>
        <div class="row header-line">
            <div class="col link-button-wrapper">
                <link-button v-for="link in pageButton" :link="link"></link-button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { goLinkButton, PageConfigLink, YamlConfig } from '../utils/PageConfig'
import { nextTick, Ref } from 'vue';
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import message from '../utils/message'
import GetPageConfig from '../utils/PageConfig'
import { marked } from 'marked'
import LinkButton from '../components/LinkButton.vue'

const route = useRoute();
const router = useRouter();

const title = ref("CCBC Archive");
const pageHtml: Ref<string[]> = ref([]);
const pageButton: Ref<PageConfigLink[]> = ref([]);

onMounted(async () => {
    const confPath = route.query.c;
    console.log("Load conf:", confPath);
    if (!confPath) {
        message("danger", "无法加载页面数据");
        return;
    }

    const conf = await GetPageConfig(confPath.toString());
    initConf(conf);
});

function initConf(conf: YamlConfig) {
    if (conf.type !== "page") {
        message("danger", "页面配置错误");
        return;
    }
    title.value = conf.title;
    document.title = `${conf.title} - CCBC Archive`;
    pageHtml.value = conf.content.map(content => marked(content));
    if (conf.links) {
        pageButton.value = conf.links;
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