<script setup lang="ts">
import { nextTick, ref } from 'vue';
import MessageToasts from './components/MessageToasts.vue';
import gBus from './globalBus';

const isRouterVisible = ref(true);
gBus.on("reload", () => {
  isRouterVisible.value = false;
  nextTick(() => {
    isRouterVisible.value = true;
  });
});
</script>

<template>
  <message-toasts></message-toasts>
  <div class="main-app-view">
    <router-view v-if="isRouterVisible"></router-view>
  </div>
  <div class="nav-footer">
    <div class="container-md">
      Powered by CCBC Archive Viewer | <a href="https://cipherpuzzles.com/" target="_blank">密码菌主页</a> | <a href="http://beian.miit.gov.cn/" target="_blank">京ICP备2021017804号</a>
    </div>
  </div>
</template>

<style lang="scss">
@import "../node_modules/bootstrap/dist/css/bootstrap.css";

body {
  margin: 0;
  background-color: #1e1e1e;
  color: #ffffff;
}
.main-app-view {
  min-height: 120vh;
}
.header-line {
    margin-top: 60px;
    margin-bottom: 150px;
}
.nav-footer {
    margin-top: 200px;
    padding-top: 5px;
    font-size: 10px;
    color: #999999;
    background-color: #2f2f2f;
    height: 100px;
}
.nav-footer a {
    color: #c3cae7;
    text-decoration: none;
    transition: all .5s linear;
}
.nav-footer a:hover {
    color: #5071f5;
    text-decoration: underline;
}
.link-button-wrapper {
  button {
    margin-right: 10px;
    margin-bottom: 10px;
  }
}
</style>
