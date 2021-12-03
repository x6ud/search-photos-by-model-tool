import Vue from 'vue';
import {getPhotoAuthorLink, getPhotoSourceType, getSourceLink, PhotoSourceType} from '../utils/photo';

export default class ImageViewer extends Vue.extend({
    props: {
        show: Boolean,
        imageUrl: String,
        id: String,
        author: String,
        source: String,
        flip: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            width: 0,
            height: 0,
            zoom: 1
        };
    },
    watch: {
        imageUrl(url) {
            this.width = 0;
            this.height = 0;
            this.zoom = 1;
            const image = new Image();
            image.onload = () => {
                this.width = image.width;
                this.height = image.height;
                const maxWidth = document.documentElement.clientWidth * 0.9;
                const maxHeight = document.documentElement.clientHeight * 0.9;
                this.zoom = Math.min(
                    maxWidth / image.width,
                    maxHeight / image.height,
                    1
                );
            };
            image.src = url;
        }
    },
    computed: {
        imgStyle(): { [name: string]: string } {
            return {
                'margin-left': -(this.width / 2 | 0) + 'px',
                'margin-top': -(this.height / 2 | 0) + 'px',
                transform: `scaleX(${this.zoom * (this.flip ? -1 : 1)}) scaleY(${this.zoom})`
            };
        },
        sourceType(): PhotoSourceType {
            return getPhotoSourceType(this.imageUrl);
        },
        sourceLink(): string {
            return getSourceLink(this.sourceType) || '';
        },
        authorLink(): string | null {
            return getPhotoAuthorLink(
                this.sourceType,
                this.id,
                this.source
            );
        },
    },
    methods: {
        close() {
            this.$emit('update:show', false);
        },
    }
}) {
}
