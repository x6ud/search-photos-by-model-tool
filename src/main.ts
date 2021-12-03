import {AutoComplete, Button, Icon, Input, Select, Slider, Spin} from 'ant-design-vue';
import 'ant-design-vue/lib/auto-complete/style/css';
import 'ant-design-vue/lib/button/style/css';
import 'ant-design-vue/lib/icon/style/css';
import 'ant-design-vue/lib/input/style/css';
import 'ant-design-vue/lib/message/style/css';
import 'ant-design-vue/lib/modal/style/css';
import 'ant-design-vue/lib/select/style/css';
import 'ant-design-vue/lib/slider/style/css';
import 'ant-design-vue/lib/spin/style/css';
import Vue from 'vue';
import App from './App.vue';
import router from './router';

Vue.use(AutoComplete);
Vue.use(Button);
Vue.use(Icon);
Vue.use(Input);
Vue.use(Select);
Vue.use(Slider);
Vue.use(Spin);

new Vue({
    router,
    render: h => h(App)
}).$mount('#app');
