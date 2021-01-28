<template>
    <a-spin :style="{width: `${width}px`, height: `${height}px`}"
            :spinning="loading"
            class="model-viewer"
    >
        <canvas ref="canvas"
                :width="width"
                :height="height"
                @contextmenu.prevent
                @mousedown="dragStart"
                @mousemove="dragMove"
                @mousewheel="mouseWheel"
                @touchstart.passive="dragStart"
                @touchmove.passive="dragMove"
        ></canvas>
        <slot/>
    </a-spin>
</template>

<script lang="ts" src="./ModelViewer.ts"></script>

<style lang="scss" scoped>
    .model-viewer {
        position: relative;

        canvas {
            cursor: grab;
        }
    }
</style>
