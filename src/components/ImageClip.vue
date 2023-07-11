<template>
    <div class="image-clip">
        <div class="side">
            <div class="small">
                <img v-if="imageUrl" :src="imageUrl" alt="" :style="smallImageStyle">
            </div>
            <div class="slider-wrapper">
                <span class="prefix">Size</span>
                <a-slider class="slider"
                          :included="false"
                          v-model="clipSizeValue"
                          :min="0"
                          :max="imageClipMaxSize"/>
            </div>
        </div>

        <div class="main" ref="imageClipLarge">
            <div class="large" @mousemove="imageClipDragMove">
                <a-spin :spinning="loading">
                    <div class="image"
                         v-if="imageUrl"
                         :style="imageStyle"></div>
                </a-spin>
                <div class="image-clip"
                     v-if="imageUrl"
                     :style="imageClipStyle"
                     @mousedown="imageClipDragStart">
                </div>
            </div>
            <div class="slider-wrapper" style="width: 100%;">
                <span class="prefix">Zoom</span>
                <a-slider class="slider" :included="false" v-model="zoom" :min="10" :max="100"/>
            </div>
        </div>
    </div>
</template>

<script lang="ts" src="./ImageClip.ts"></script>

<style lang="scss" scoped>
.image-clip {
    display: flex;
    align-items: flex-start;

    .slider-wrapper {
        display: flex;
        line-height: 36px;
        align-items: center;

        .prefix, .postfix {
            display: inline-block;
            vertical-align: middle;
            min-width: 2.5em;
            text-align: center;
            font-size: 12px;
        }

        .prefix {
            margin-right: .5em;
        }

        .slider {
            flex: 1;
            vertical-align: middle;
        }
    }

    .side {
        flex: 0 0 160px;

        .small {
            position: relative;
            width: 160px;
            height: 160px;
            background-color: #f2f2f2;
            overflow: hidden;
        }
    }

    .main {
        flex: 1 1;
        display: flex;
        align-items: flex-start;
        flex-direction: column;
        height: 100%;
        margin-left: 10px;
        min-width: 0;

        .large {
            flex: 1 0;
            position: relative;
            width: 100%;
            height: 100%;
            background-color: #f2f2f2;
            overflow: auto;

            .image-clip {
                position: absolute;
                z-index: 1;
                box-sizing: border-box;
                border: solid 1px #409EFF;
                background-color: rgba(64, 158, 255, 0.25);
                cursor: move;
            }
        }

        & ::v-deep {
            .ant-spin-nested-loading {
                width: 100%;
                height: 100%;
            }
        }
    }
}
</style>
