<template>
    <span v-if="roleid == -1" class="rolebadge banned">被封禁用户</span>
    <span v-else-if="roleid == 0" class="rolebadge unactivate">未激活</span>
    <span v-else-if="roleid == 1" class="rolebadge normal">未报名用户</span>
    <span v-else-if="roleid == 2" class="rolebadge member">队员</span>
    <span v-else-if="roleid == 3" class="rolebadge leader">队长</span>
    <span v-else-if="roleid == 4" class="rolebadge organizer">STAFF</span>
    <span v-else-if="roleid == 5" class="rolebadge admin">ADMIN</span>
    <span v-else class="rolebadge uma">未知生物</span>
</template>

<script setup lang="ts">
defineProps({
    roleid: {
        type: Number,
        required: true
    }
});
</script>

<style lang="scss" scoped>
.rolebadge{
    display: inline-block;
    position: absolute;
    font-size: 10px;
    line-height: 14px;
    color: #FFFFFF;
    padding: 2px 5px 2px 5px;
    border-radius: 5px;
    margin-left: 5px;
    font-weight: bold;
}
.banned{
    background-color: #888888;
}
.unactivate {
    background-color: #888888;
}
.normal{
    background-color: #1b66ac;
}
.member{
    background-color: #219c16;
}
.leader{
    background-color: #169c64;
}
.organizer{
    background-color: #d35422;
}
.admin{
    background-color: #ec6029;
}
.uma{
    background-color: #000000;
}
</style>