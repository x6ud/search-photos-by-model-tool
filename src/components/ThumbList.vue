<template>
    <div class="thumb-list"
         ref="scroll"
         @scroll="updateVisibleIndex"
    >
        <div class="list">
            <div v-for="(url, index) in thumbUrls"
                 class="thumb"
                 :class="{active: active === index}"
                 @click="select(index)"
            >
                <div class="label">#{{index + 1}}</div>
                <img :src="url" alt=""
                     v-if="index >= firstVisibleIndex && index <= lastVisibleIndex"
                >
                <a-button class="btn-remove"
                          icon="delete"
                          shape="circle"
                          size="small"
                          @click.stop="remove(index)"
                />
            </div>
        </div>
    </div>
</template>

<script lang="ts" src="./ThumbList.ts"></script>

<style lang="scss" scoped>
    .thumb-list {
        width: 100%;
        box-sizing: border-box;
        padding-right: 8px;
        overflow-y: scroll;

        .list {
            width: 100%;
            margin: 0 auto;

            .thumb {
                display: flex;
                align-items: center;
                justify-content: center;
                position: relative;
                width: 100%;
                height: 116px;
                box-sizing: border-box;
                margin-bottom: 8px;
                background: #f2f2f2;
                cursor: pointer;
                transition: background-color .3s;

                &.active {
                    background-color: #69b7ff;
                }

                img {
                    max-width: 100px;
                    max-height: 100px;
                }

                .label {
                    position: absolute;
                    z-index: 2;
                    left: 4px;
                    top: 4px;
                    pointer-events: none;
                    user-select: none;
                }

                .btn-remove {
                    position: absolute;
                    z-index: 2;
                    top: 4px;
                    right: 4px;
                    border-color: transparent;
                    opacity: 0;
                    transition: all .3s;
                }

                &:hover {
                    .btn-remove {
                        opacity: 1;
                    }
                }
            }
        }
    }
</style>
