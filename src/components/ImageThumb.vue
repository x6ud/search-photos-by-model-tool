<template>
    <a-spin class="thumb" :spinning="loading">
        <div class="thumb-inner-wrapper"
             :style="{width: size + 'px', height: size + 'px'}"
             :class="{flip: this.image && image.flip}">
            <img v-if="image && image.url" :style="imgStyle" :src="image.url" alt="">
            <slot/>
        </div>
    </a-spin>
</template>

<script>
    function isElementInViewport(el) {
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

    function getScrollableParent(node) {
        if (node == null) {
            return null;
        }
        if (node.scrollHeight > node.clientHeight) {
            return node;
        } else {
            return getScrollableParent(node.parentNode);
        }
    }

    /**
     * Lazy loading image
     */
    export default {
        data() {
            return {
                loading: false,
                handlerRemoved: false
            };
        },
        props: {
            // a thumb info object contains image url and thumb position, see Search.vue
            image: Object,
            // size of the thumb
            size: {
                type: Number,
                default: 160
            }
        },
        computed: {
            imgStyle() {
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
            document.addEventListener('scroll', this.checkVisibilityChange, false);
            document.addEventListener('resize', this.checkVisibilityChange, false);
            const parent = this._parent = getScrollableParent(this.$el);
            parent && parent.addEventListener('scroll', this.checkVisibilityChange, false);
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
                    image.src = this.image && this.image.url;
                    this.removeHandlers();
                }
            },
            removeHandlers() {
                if (this.handlerRemoved) {
                    return;
                }
                document.removeEventListener('scroll', this.checkVisibilityChange);
                document.removeEventListener('resize', this.checkVisibilityChange);
                this._parent && this._parent.removeEventListener('scroll', this.checkVisibilityChange);
                this.handlerRemoved = true;
            }
        }
    };
</script>

<style lang="scss" scoped>
    .thumb {
        display: inline-block;

        .thumb-inner-wrapper {
            position: relative;
            background-color: #f2f2f2;
            overflow: hidden;

            &.flip {
                transform: scale(-1, 1);
                transform-origin: 50% 50%;
            }

            img {
                position: absolute;
            }
        }
    }
</style>