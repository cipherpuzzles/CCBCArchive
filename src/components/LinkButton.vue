<template>
    <button class="btn btn-primary" @click="doLinkButton(props.link!)">{{ props.link?.title }}</button>
</template>

<script setup lang="ts">
import { PropType } from 'vue';
import { useRouter } from 'vue-router';
import { goLinkButton, PageConfigLink } from '../utils/PageConfig';

const router = useRouter();

const props = defineProps({
    link: Object as PropType<PageConfigLink>,
});

function doLinkButton(link: PageConfigLink) {
    goLinkButton(link, router);
}
</script>