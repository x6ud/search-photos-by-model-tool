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

            <a-button @click="openAuthorLink"
                      size="small"
                      class="btn-source"
                      v-if="flickrAuthorLink"
            >
                Click here for more information about this picture
            </a-button>
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

            .btn-source {
                position: absolute;
                top: 8px;
                right: 40px;
            }
        }
    }
</style>
