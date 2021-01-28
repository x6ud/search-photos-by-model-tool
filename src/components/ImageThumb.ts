import Vue, {PropType} from 'vue'

function isElementInViewport(el: Element) {
    const rect = el.getBoundingClientRect(),
        width = rect.right - rect.left,
        height = rect.bottom - rect.top;
    return (
        rect.top > -height &&
        rect.left > -width &&
        rect.bottom < (window.innerHeight || document.documentElement.clientHeight) + height &&
        rect.right < (window.innerWidth || document.documentElement.clientWidth) + width
    );
}

function getScrollableParent(node?: Element | null): Element | undefined {
    if (node == null) {
        return undefined;
    }
    if (node.scrollHeight > node.clientHeight) {
        return node;
    } else {
        return getScrollableParent(node.parentNode as Element);
    }
}

type ImageClip = {
    url: string;
    w: number;
    h: number;
    flip: boolean;
    cx: number;
    cy: number;
    cs: number;
};

export default class ImageThumb extends Vue.extend({
    data() {
        return {
            loading: false,
            handlerRemoved: false
        };
    },
    props: {
        image: Object as PropType<ImageClip>,
        size: {
            type: Number,
            default: 160
        }
    },
    computed: {
        imgStyle(): { [name: string]: string } {
            const image = this.image;
            if (!(image && image.url)) {
                return {};
            }
            const scale = 1 / image.cs * this.size;
            return {
                width: image.w * scale + 'px',
                height: image.h * scale + 'px',
                left: -image.cx * scale + 'px',
                top: -image.cy * scale + 'px'
            };
        }
    },
    mounted() {
        const imageThumb = this as ImageThumb;
        const parent = imageThumb.parent = getScrollableParent(this.$el);

        document.addEventListener('scroll', this.checkVisibilityChange, false);
        document.addEventListener('resize', this.checkVisibilityChange, false);
        parent?.addEventListener('scroll', this.checkVisibilityChange, false);

        this.checkVisibilityChange();
    },
    methods: {
        checkVisibilityChange() {
            if (isElementInViewport(this.$el)) {
                this.loading = true;
                const image = new Image();
                image.onload = () => {
                    this.loading = false;
                };
                image.onerror = () => {
                    this.loading = false;
                };
                image.src = this.image?.url;
                this.removeHandlers();
            }
        },
        removeHandlers() {
            if (this.handlerRemoved) {
                return;
            }
            document.removeEventListener('scroll', this.checkVisibilityChange);
            document.removeEventListener('resize', this.checkVisibilityChange);
            const imageThumb = this as ImageThumb;
            imageThumb.parent?.removeEventListener('scroll', this.checkVisibilityChange);
            this.handlerRemoved = true;
        }
    }
}) {
    parent?: Element;
}
