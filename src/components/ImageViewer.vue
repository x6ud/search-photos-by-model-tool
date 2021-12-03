<template>
    <div class="image-viewer-mask">
        <div class="image-viewer"
             v-if="show"
             @click.self="close"
        >
            <img :src="imageUrl" alt="" :style="imgStyle">

            <div class="btn-close" @click="close">
                <a-icon type="close"/>
            </div>

            <div class="author-info">
                <div v-if="author">
                    Photo by <a :href="authorLink" target="_blank">{{ author }}</a>
                    on <a :href="sourceLink" target="_blank">{{ sourceType }}</a>
                </div>
                <div v-if="!author && sourceType">
                    <a :href="authorLink" target="_blank">View this photo on {{ sourceType }}</a>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" src="./ImageViewer.ts"></script>

<style lang="scss" scoped>
.image-viewer-mask {
    position: fixed;
    z-index: 1000;
    left: 0;
    top: 0;
    max-width: 0;
    max-height: 0;

    .image-viewer {
        position: fixed;
        z-index: 1000;
        left: 0;
        top: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.5);
        overflow: hidden;

        img {
            position: absolute;
            left: 50%;
            top: 50%;
            transform-origin: 50% 50%;
            box-shadow: 0 0 12px rgba(0, 0, 0, .5);
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

        .author-info {
            display: flex;
            align-items: center;
            justify-content: center;
            position: absolute;
            z-index: 1;
            left: 0;
            right: 0;
            bottom: 0;
            height: 30px;
            font-size: 16px;
            color: #fff;
            font-style: italic;

            a {
                color: #fff;
                text-decoration: underline;
            }
        }
    }
}
</style>
