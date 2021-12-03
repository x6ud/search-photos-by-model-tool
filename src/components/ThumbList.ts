import Vue, {PropType} from 'vue';
import {getFlickrThumb} from '../utils/flickr';
import throttle from '../utils/throttle';

const THUMB_SIZE = 116;
const THUMB_MARGIN = 8;

export default class ThumbList extends Vue.extend({
    props: {
        images: Array as PropType<{ url: string }[]>,
        active: Number
    },
    data() {
        return {
            firstVisibleIndex: -1,
            lastVisibleIndex: -1
        };
    },
    computed: {
        thumbUrls(): string[] {
            return (this.images || []).map(record => getFlickrThumb(record.url));
        },
    },
    mounted() {
        this.updateVisibleIndex();
    },
    watch: {
        active(index) {
            this.$nextTick(() => {
                if (index >= 0 && (index < this.firstVisibleIndex || index > this.lastVisibleIndex)) {
                    const scroll = this.$refs.scroll as HTMLDivElement;
                    if (scroll) {
                        scroll.scrollTop = index * (THUMB_SIZE + THUMB_MARGIN);
                    }
                }
            });
        }
    },
    methods: {
        updateVisibleIndex: throttle(
            function (this: ThumbList) {
                if (!this.$refs) {
                    return;
                }
                const scroll = this.$refs.scroll as HTMLDivElement;
                if (!scroll) {
                    return;
                }
                this.firstVisibleIndex = Math.floor(scroll.scrollTop / (THUMB_SIZE + THUMB_MARGIN));
                this.lastVisibleIndex = this.firstVisibleIndex + Math.ceil(scroll.clientHeight / (THUMB_SIZE + THUMB_MARGIN));
            },
            50
        ),
        select(index: number) {
            this.$emit('select', index);
        },
        remove(index: number) {
            this.$emit('remove', index);
        }
    }
}) {
}
