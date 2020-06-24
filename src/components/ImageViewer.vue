<template>
    <div class="wrapper" :style="{'z-index': zIndex}">
        <div class="modal"
             :style="{'z-index': zIndex}"
             v-if="show"
             @click.self="close"
        >
            <img :src="image" alt="" :style="imgStyle">
            <a v-if="flickrLink" :href="flickrLink" class="flickr-link" target="_blank">Click here for more information about this picture</a>
            <div class="btn-close" @click="close">
                <a-icon type="close"/>
            </div>
        </div>
    </div>
</template>

<script>
    import getFlickrId from '../utils/get-flickr-id'

    /**
     * Show full screen large image
     */
    export default {
        props: {
            show: Boolean,
            // image url
            image: String,
            zIndex: {
                type: Number,
                default: 1000
            },
            // flip the image horizontally
            flip: {
                type: Boolean,
                default: false
            }
        },
        data() {
            return {
                width: 0,
                height: 0,
                scale: 1
            };
        },
        watch: {
            image(url) {
                this.width = 0;
                this.height = 0;
                this.scale = 1;
                const image = new Image();
                image.onload = () => {
                    this.width = image.width;
                    this.height = image.height;

                    const maxWidth = document.documentElement.clientWidth * 0.9,
                        maxHeight = document.documentElement.clientHeight * 0.9;
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
            imgStyle() {
                return {
                    'margin-left': -(this.width / 2 | 0) + 'px',
                    'margin-top': -(this.height / 2 | 0) + 'px',
                    transform: `scaleX(${this.zoom * (this.flip ? -1 : 1)}) scaleY(${this.zoom})`
                };
            },
            flickrLink() {
                const id = getFlickrId(this.image);
                return id && `https://www.flickr.com/photo.gne?id=${id}`;
            }
        },
        methods: {
            close() {
                this.$emit('update:show', false);
            }
        }
    };
</script>

<style lang="scss" scoped>
    .wrapper {
        position: fixed;
        left: 0;
        top: 0;
        max-width: 0;
        max-height: 0;

        .modal {
            position: fixed;
            left: 0;
            top: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0, 0, 0, 0.35);
            overflow: hidden;

            img {
                position: absolute;
                left: 50%;
                top: 50%;
                transform-origin: 50% 50%;
            }

            .flickr-link {
                display: block;
                position: absolute;
                z-index: 1;
                top: 8px;
                right: 48px;
                color: #fff;
                line-height: 24px;

                &:hover {
                    text-decoration: underline;
                }
            }

            .btn-close {
                position: absolute;
                top: 8px;
                right: 8px;
                z-index: 1;
                cursor: pointer;
                font-size: 16px;
                color: #fff;
                width: 24px;
                height: 24px;
                line-height: 24px;
                text-align: center;
                vertical-align: middle;
                border-radius: 100%;
                background-color: rgba(0, 0, 0, 0.35);
            }
        }
    }
</style>
