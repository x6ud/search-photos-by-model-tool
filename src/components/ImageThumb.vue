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

<script lang="ts" src="./ImageThumb.ts"></script>

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
