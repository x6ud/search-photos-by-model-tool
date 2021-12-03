<template>
    <div id="app">
        <router-view/>
    </div>
</template>

<script lang="ts">
import {message} from 'ant-design-vue';
import Vue from 'vue';

export default Vue.extend({
    mounted(): void {
        window.addEventListener('error', this.onError);
        window.addEventListener('unhandledrejection', this.onUnhandledRejection);
        Vue.config.errorHandler = this.vueErrorHandler;
        this.$once('hook:beforeDestroy', () => {
            window.removeEventListener('error', this.onError);
            window.removeEventListener('unhandledrejection', this.onUnhandledRejection);
            delete Vue.config.errorHandler;
        });
    },
    methods: {
        onError(e: ErrorEvent) {
            this.showErrorMessage(e.error);
        },
        onUnhandledRejection(e: PromiseRejectionEvent) {
            this.showErrorMessage(e.reason);
        },
        vueErrorHandler(err: Error, vm: Vue, info: string) {
            this.showErrorMessage(err);
        },
        showErrorMessage(error: any) {
            console.error(error);
            if (error instanceof Error) {
                message.error(error.message);
            } else {
                message.error(error + '');
            }
        }
    }
});
</script>

<style>
html {
    width: 100%;
    height: 100%;
}

body {
    width: 100%;
    height: 100%;
    margin: 0;
}

#app {
    width: 100%;
    height: 100%;
    font-size: 14px;
    font-family: arial, sans-serif;
}
</style>
