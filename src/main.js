import Vue from 'vue'
import App from './App.vue'
import router from './router'

import {Button, Icon, Input, Select, Slider, Spin} from 'ant-design-vue'
import 'ant-design-vue/lib/button/style/css'
import 'ant-design-vue/lib/icon/style/css'
import 'ant-design-vue/lib/input/style/css'
import 'ant-design-vue/lib/select/style/css'
import 'ant-design-vue/lib/slider/style/css'
import 'ant-design-vue/lib/spin/style/css'

Vue.use(Button);
Vue.use(Icon);
Vue.use(Input);
Vue.use(Select);
Vue.use(Slider);
Vue.use(Spin);

// fix: url changing dost not trigger router in ie
if (
    '-ms-scroll-limit' in document.documentElement.style
    && '-ms-ime-align' in document.documentElement.style
) {
    window.addEventListener('hashchange', () => {
        router.push(window.location.hash.slice(1))
    }, false);
}

Vue.config.productionTip = false;

new Vue({
    router,
    render: h => h(App)
}).$mount('#app');