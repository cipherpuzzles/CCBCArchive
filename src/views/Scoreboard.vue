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
        <div class="row" v-if="finishedGroups && finishedGroups.length > 0">
            <div class="col">
                <h3>完赛队伍</h3>
                <p>恭喜以下队伍完成了全部赛程并取得名次。</p>
                <table class="table table-dark table-hover">
                    <colgroup>
                        <col v-for="col in tableColumns" :width="col.width" />
                    </colgroup>
                    <thead>
                        <tr>
                            <th v-for="col in tableColumns" scope="col">{{ col.name }}</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(g, idx) in finishedGroups">
                            <template v-for="col in tableColumns">
                                <th scope="row" v-if="col.type === 'index'">{{ idx + 1}}</th>
                                <td v-else-if="col.type === 'group_name'" class="table-cell">
                                    <div class="group-title">{{ g.group_name }}</div>
                                    <div class="group-profile">{{ g.group_profile }}</div>
                                </td>
                                <td v-else-if="col.type === 'double'">{{ (g[col.prop] as number).toFixed(2) }}</td>
                                <td v-else-if="col.type === 'int'">{{ g[col.prop] }}</td>
                                <td v-else>{{ g[col.prop] }}</td>
                            </template>
                        </tr>
                    </tbody>
                </table>
            </div>  
        </div>
        <div class="row" v-if="groups && groups.length > 0">
            <div class="col">
                <h3>未完赛队伍</h3>
                <p>以下队伍虽然未能完赛，但也在本次比赛中成功参与并取得成绩。</p>
                <table class="table table-dark table-hover">
                    <colgroup>
                        <col v-for="col in tableColumns" :width="col.width" />
                    </colgroup>
                    <thead>
                        <tr>
                            <th v-for="col in tableColumns" scope="col">{{ col.name }}</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(g, idx) in groups">
                            <template v-for="col in tableColumns">
                                <th scope="row" v-if="col.type === 'index'">{{ idx + 1 + (finishedGroups ? finishedGroups.length : 0)}}</th>
                                <td v-else-if="col.type === 'group_name'" class="table-cell">
                                    <div class="group-title">{{ g.group_name }}</div>
                                    <div class="group-profile">{{ g.group_profile }}</div>
                                </td>
                                <td v-else-if="col.type === 'double'">{{ (g[col.prop] as number).toFixed(2) }}</td>
                                <td v-else-if="col.type === 'int'">{{ g[col.prop] }}</td>
                                <td v-else>{{ g[col.prop] }}</td>
                            </template>
                        </tr>
                    </tbody>
                </table>
            </div>  
        </div>
        <div class="row header-line">
            <div class="col link-button-wrapper">
                <link-button v-for="link in pageButton" :link="link"></link-button>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.group-title{
    overflow: hidden;
    word-break: break-all;
    text-overflow: ellipsis;
}
.group-profile{
    color: #999999;
    word-break: break-all;
    height: 3rem;
    overflow: hidden;
    text-overflow: ellipsis;
}
</style>

<script setup lang="ts">
import { goLinkButton, GroupColumn, PageConfigLink, YamlConfig } from '../utils/PageConfig'
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

const tableColumns: Ref<GroupColumn[]> = ref([]);
const finishedGroups: Ref<Record<string, string | number>[]> = ref([]);
const groups: Ref<Record<string, string | number>[]> = ref([]);

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
    if (conf.type !== "scoreboard") {
        message("danger", "页面配置错误");
        return;
    }
    title.value = conf.title;
    document.title = `${conf.title} - CCBC Archive`;
    pageHtml.value = conf.content.map(content => marked(content));
    if (conf.links) {
        pageButton.value = conf.links;
    }

    if (conf.scoreboarddata.finished_groups) {
        finishedGroups.value = conf.scoreboarddata.finished_groups;
    }
    if (conf.scoreboarddata.groups) {
        groups.value = conf.scoreboarddata.groups;
    }
    if (conf.scoreboarddata.table_columns) {
        tableColumns.value = conf.scoreboarddata.table_columns;
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