<template>
    <div class="wrapper">
        <div class="column condition" :class="{collapsed: collapseSearchConditions}">
            <div class="inner-wrapper">
                <h4>Species:</h4>
                <div class="row" style="margin-bottom: 8px">
                    <a-spin :spinning="loading"
                            style="flex: 1 1; min-width: 0;">
                        <a-select style="width: 100%;"
                                  placeholder="any"
                                  show-search
                                  v-model="keyword">
                            <a-select-option :key="''">any</a-select-option>
                            <a-select-option v-for="tag in tags" :key="tag">{{tag}}</a-select-option>
                        </a-select>
                    </a-spin>
                    <a-button type="primary" @click="search">Search</a-button>
                </div>

                <h4>Direction: (skull type does not affect search results)</h4>
                <div class="row">
                    <a-select v-model="model.url"
                              show-search
                              style="width: 100%;">
                        <a-select-option v-for="option in models"
                                         :key="option.path"
                                         :value="option.path">
                            {{option.name}}
                        </a-select-option>
                    </a-select>
                </div>
                <model-viewer :model-url="model.url"
                              :rotate-x.sync="model.rotateX"
                              :rotate-y.sync="model.rotateY"
                              :rotate-z.sync="model.rotateZ"
                              :zoom.sync="model.zoom"
                              :width="modelViewerSize"
                              :height="modelViewerSize"
                >
                    <a style="position: absolute; right: 8px; top: 8px; line-height: 14px;"
                       target="_blank" title="Author of this model"
                       v-if="modelAuthorLink"
                       :href="modelAuthorLink">
                        <a-icon type="info-circle"/>
                    </a>
                </model-viewer>

                <div class="row">
                    <span>X: {{model.rotateX}}; Y: {{model.rotateY}}; Z: </span>
                    <a-slider :included="false"
                              v-model="model.rotateZ"
                              :min="-180"
                              :max="180"
                              style="flex: 1 1; min-width: 0;"
                    />
                    <div>
                        <span style="width: 2.5em; text-align: center; display: inline-block;">{{model.rotateZ}}</span>
                        <a-button @click="model.rotateX = model.rotateY = model.rotateZ = 0"
                                  size="small"
                        >
                            Reset
                        </a-button>
                    </div>
                </div>

                <div class="info" style="color: #bfbfbf">
                    <div>Author: x6udpngx</div>
                    <div>
                        Special Thanks: <a href="https://github.com/xrabohrok" target="_blank">xrabohrok</a>
                        - Thank you for helping improve this tool!
                    </div>
                    <div>Latest update: 2021-10-22</div>
                    <div>
                        <a href="https://github.com/x6ud/x6ud.github.io/issues" target="_blank">Leave a message</a>
                    </div>
                    <div>
                        <a href="https://github.com/x6ud/search-photos-by-model-tool" target="_blank">Source code</a>
                    </div>
                    <div>
                        <span>Support me:</span>
                        <a href="https://ko-fi.com/x6udpngx" target="_blank">
                            <span style="vertical-align: middle;">Ko-fi.com/x6udpngx</span>
                        </a>
                    </div>
                </div>
            </div>

            <div class="collapse-handler" @click="collapseSearchConditions = !collapseSearchConditions">
                <a-icon class="icon" type="up"/>
            </div>
        </div>

        <div class="column result">
            <div class="list">
                <image-thumb class="item"
                             v-for="item in result"
                             :image="item"
                             :key="item.url"
                             :size="200"
                             @click.native="show(item)"
                />
            </div>
        </div>

        <image-viewer :show.sync="large.show"
                      :image-url="large.imageUrl"
                      :flip="large.flip"
        />
    </div>
</template>

<script lang="ts" src="./Search.ts"></script>

<style lang="scss" scoped>
    .wrapper {
        display: flex;
        align-items: flex-start;
        width: 100%;
        height: 100%;
        box-sizing: border-box;
        padding: 10px;

        .column {
            display: flex;
            flex-direction: column;

            &:not(:last-child) {
                margin-right: 10px;
            }

            .row {
                display: flex;
                width: 100%;
                align-items: center;

                &:not(:last-child) {
                    margin-bottom: .5em;
                }

                & > * {
                    &:not(:last-child) {
                        min-width: 0;
                        margin-right: .5em;
                    }
                }
            }
        }

        .column.condition {
            flex: 0 0 360px;
            width: 360px;

            .inner-wrapper {
                display: flex;
                flex-direction: column;
                flex: 1 1;
                min-height: 0;
                width: 100%;
            }

            .collapse-handler {
                display: none;
            }
        }

        .column.result {
            flex: 1 1;
            min-width: 0;
            height: 100%;

            .list {
                width: 100%;
                height: 100%;
                overflow-y: scroll;
                box-sizing: border-box;
                border: 1px solid #d9d9d9;
                border-radius: 4px;
                padding: 10px;

                .item {
                    margin: 5px;
                    cursor: zoom-in;
                }
            }
        }
    }

    @media screen and (max-width: 480px) {
        .wrapper {
            display: block !important;
            overflow: hidden;
            position: relative;
            box-sizing: border-box;
            width: 100%;
            height: 100%;
            padding: 0 !important;

            .column.condition {
                position: fixed;
                left: 0;
                top: 0;
                z-index: 1;
                width: 100%;
                height: 100%;
                box-sizing: border-box;
                background-color: #fff;
                overflow: auto;
                transition: height .3s;

                .inner-wrapper {
                    width: 360px;
                    margin: 0 auto;
                    padding: 10px 0;
                }

                $handler-size: 48px;

                .collapse-handler {
                    display: block !important;
                    position: fixed;
                    left: 50%;
                    top: 100%;
                    width: $handler-size;
                    height: $handler-size;
                    margin: (-$handler-size / 2) 0 0 (-$handler-size / 2);
                    border-radius: 100%;
                    overflow: hidden;
                    background-color: rgba(0, 0, 0, 0.2);
                    color: #fff;
                    font-size: 20px;
                    text-align: center;

                    .icon {
                        width: $handler-size;
                    }
                }

                &.collapsed {
                    height: 0 !important;

                    .collapse-handler {
                        top: 0 !important;

                        .icon {
                            transform-origin: 50% 50%;
                            transform: rotate(180deg);
                            margin-top: $handler-size / 2;
                        }
                    }
                }
            }

            .column.result {
            }
        }
    }
</style>
