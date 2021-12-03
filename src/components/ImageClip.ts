import Vue from 'vue';

const THUMB_SIZE = 160;

export default class ImageClip extends Vue.extend({
    props: {
        imageUrl: String,
        imageWidth: Number,
        imageHeight: Number,
        clipLeft: Number,
        clipTop: Number,
        clipSize: Number
    },
    data() {
        return {
            loading: false,
            zoom: 1,
            dragging: false,
            dragX: 0,
            dragY: 0,
            clipSizeValue: 0
        };
    },
    computed: {
        imageStyle(): { [key: string]: string } {
            return {
                background: `url(${this.imageUrl}) 0 0 / 100% 100% no-repeat`,
                width: this.imageWidth * this.zoom / 100 + 'px',
                height: this.imageHeight * this.zoom / 100 + 'px',
            };
        },
        imageClipStyle(): { [key: string]: string } {
            return {
                left: this.clipLeft * this.zoom / 100 + 'px',
                top: this.clipTop * this.zoom / 100 + 'px',
                width: this.clipSize * this.zoom / 100 + 'px',
                height: this.clipSize * this.zoom / 100 + 'px'
            };
        },
        imageClipMaxSize(): number {
            return Math.min(this.imageWidth, this.imageHeight);
        },
        smallImageStyle(): { [key: string]: string } {
            const scale = 1 / this.clipSize * THUMB_SIZE;
            return {
                position: 'absolute',
                width: this.imageWidth * scale + 'px',
                height: this.imageHeight * scale + 'px',
                left: -this.clipLeft * scale + 'px',
                top: -this.clipTop * scale + 'px'
            };
        },
    },
    watch: {
        imageUrl: {
            immediate: true,
            handler(url) {
                if (!url) {
                    return;
                }
                this.loading = true;
                const image = new Image();
                image.onload = () => {
                    this.loading = false;
                    const dom = this.$refs.imageClipLarge as HTMLDivElement;
                    this.zoom =
                        Math.min(
                            image.width,
                            image.height,
                            dom.clientWidth - 18,
                            dom.clientHeight - 18 - 32
                        )
                        / image.width * 100 | 0;

                    const width = image.width;
                    const height = image.height;
                    const clipSize = Math.min(width, height, this.clipSizeValue < 1 ? width : this.clipSizeValue);
                    this.$emit('update:imageWidth', width);
                    this.$emit('update:imageHeight', height);
                    this.$emit('update:clipSize', clipSize);
                };
                image.onerror = image.onabort = () => {
                    this.loading = false;
                };
                image.src = url;
            }
        },
        clipSize: {
            immediate: true,
            handler(clipSize: number) {
                this.clipSizeValue = clipSize;
                this.$emit('update:clipLeft', Math.min(this.clipLeft, this.imageWidth - clipSize));
                this.$emit('update:clipTop', Math.min(this.clipTop, this.imageHeight - clipSize));
            }
        },
        clipSizeValue(clipSize: number) {
            this.$emit('update:clipSize', clipSize);
        }
    },
    mounted() {
        window.addEventListener('mouseup', this.imageClipDragStop);
        this.$once('hook:beforeDestroy', () => {
            window.removeEventListener('mouseup', this.imageClipDragStop);
        });
    },
    methods: {
        imageClipDragStart(e: MouseEvent) {
            if (e.button === 0) {
                this.dragging = true;
                this.dragX = e.clientX;
                this.dragY = e.clientY;
            }
        },
        imageClipDragStop() {
            this.dragging = false;
        },
        imageClipDragMove(e: MouseEvent) {
            const x0 = this.dragX;
            const y0 = this.dragY;
            const x1 = e.clientX;
            const y1 = e.clientY;

            this.dragX = x1;
            this.dragY = y1;

            if (!this.dragging) {
                return;
            }
            const dx = x1 - x0;
            const dy = y1 - y0;

            let left = this.clipLeft;
            let top = this.clipTop;
            left += dx / (this.zoom / 100);
            left = Math.max(0, Math.min(this.imageWidth - this.clipSize, left));
            top += dy / (this.zoom / 100);
            top = Math.max(0, Math.min(this.imageHeight - this.clipSize, top));

            this.$emit('update:clipLeft', left);
            this.$emit('update:clipTop', top);
        },
    }
}) {
}
