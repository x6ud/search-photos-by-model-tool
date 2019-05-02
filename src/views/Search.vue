<template>
    <div style="width: 100%; height: 100%;">
        <div class="wrapper">
            <div class="column-1" :class="{collapsed: collapse}">
                <div class="inner-wrapper">
                    <div style="margin-bottom: 8px;">Species:</div>

                    <div class="search" style="display: flex; margin-bottom: 8px;">
                        <a-spin :spinning="loading"
                                style="flex: 1 1; margin-right: 8px;">
                            <a-select
                                style="width: 100%;"
                                placeholder="any"
                                v-model="keyword">
                                <a-select-option :key="''">any</a-select-option>
                                <a-select-option v-for="tag in tags" :key="tag">{{tag}}</a-select-option>
                            </a-select>
                        </a-spin>
                        <a-button type="primary" @click="search">Search</a-button>
                    </div>

                    <div style="margin-bottom: 8px;">Direction: (skull type does not affect search results)</div>

                    <a-select v-model="model" style="width: 100%; margin-bottom: 8px;">
                        <a-select-option v-for="option in models"
                                         :key="option.path"
                                         :value="option.path">
                            {{option.name}}
                        </a-select-option>
                    </a-select>

                    <model-viewer :width="360"
                                  :height="360"
                                  :model="model"
                                  :rotate-x.sync="rotateX"
                                  :rotate-y.sync="rotateY"
                                  :rotate-z.sync="rotateZ"
                                  :zoom.sync="zoom"
                                  class="model"
                    >
                        <a style="position: absolute; right: 8px; top: 8px; line-height: 14px;"
                           target="_blank" title="Author of this model"
                           v-if="currentModelOrigin"
                           :href="currentModelOrigin">
                            <a-icon type="info-circle"/>
                        </a>
                    </model-viewer>

                    <div class="slider-wrapper">
                        <span class="prefix">X: {{rotateX}}; Y: {{rotateY}}; Z: </span>
                        <a-slider class="slider" :included="false"
                                  v-model="rotateZ" :min="-180" :max="180"/>
                        <div class="postfix">
                            <span style="width: 2.5em; text-align: center; display: inline-block;">{{rotateZ}}</span>
                            <a-button @click="rotateX = rotateY = rotateZ = 0" size="small">Reset</a-button>
                        </div>
                    </div>

                    <div class="info" style="color: #bfbfbf">
                        <div>Author: x6udpngx</div>
                        <div>
                            Special Thanks: <a href="https://github.com/xrabohrok" target="_blank">xrabohrok</a>
                            - Thank you for helping improve this tool!
                        </div>
                        <div>Latest update: 2019-04-15</div>
                        <div>
                            <a href="https://github.com/x6ud/x6ud.github.io/issues" target="_blank">Create an issue</a>
                            <span> - Suitable photos are lacking in some directions, please leave a message if you find one on Flickr.</span>
                        </div>
                        <div>
                            <a href="https://ko-fi.com/x6udpngx" target="_blank">
                                <img src="../assets/ko-fi.png" alt="" width="14px" height="14px"
                                     style="margin-right: .25em">
                                <span style="vertical-align: middle;">Ko-fi.com/x6udpngx</span>
                            </a>
                        </div>
                    </div>
                </div>

                <div class="collapse-handler" @click="collapse = !collapse">
                    <a-icon class="icon" type="up"/>
                </div>
            </div>

            <div class="column-2">
                <div class="inner-wrapper">
                    <image-thumb class="item"
                                 v-for="item in result"
                                 :image="item"
                                 :key="item.url"
                                 :size="200"
                                 @click.native="show(item)"/>
                </div>
            </div>
        </div>

        <image-viewer :show.sync="showLarge"
                      :image="currentImage && currentImage.url"
                      :flip="currentImage && currentImage.flip"
        />
    </div>
</template>

<script>
    import ModelViewer from '../components/ModelViewer.vue'
    import ImageThumb from '../components/ImageThumb.vue'
    import ImageViewer from '../components/ImageViewer.vue'

    import models from '../models'

    export default {
        components: {ModelViewer, ImageThumb, ImageViewer},
        data() {
            return {
                // models list
                models: models,
                // current model url
                model: models[0].path,
                // model direction
                rotateX: 0,
                rotateY: 0,
                rotateZ: 0,
                zoom: 10,
                // species dropdown options
                tags: [],
                // all photos
                data: [],
                keyword: '',
                // search results
                result: [],
                // fullscreen image object
                currentImage: null,
                // whether to display fullscreen image
                showLarge: false,
                // is loading data
                loading: false,
                // collapse search on mobile device
                collapse: false
            };
        },
        computed: {
            // author link of the model
            currentModelOrigin() {
                const model = this.models.find(model => model.path === this.model);
                return model && model.origin;
            }
        },
        methods: {
            search() {
                let result = [...this.data];

                // filter by tag
                if (this.keyword) {
                    result = result.filter(item => item.tags && item.tags.includes(this.keyword));
                }

                // calculate direction similarity
                result = result.map(item => {
                    const flip = item.ry * this.rotateY < 0, // flip the image horizontally if it can match better
                        rx = item.rx,
                        ry = flip ? -item.ry : item.ry,
                        rz = flip ? -item.rz : item.rz,
                        match = Math.abs(this.rotateX - rx)
                            + Math.abs(this.rotateY - ry) * 1.5
                            + Math.abs(this.rotateZ - rz) * 0.5;
                    return {...item, flip, ry, rz, match};
                });

                /*
                 * Every search result is an object likes:
                 * {
                 *   url,
                 *   w: width,
                 *   h: height,
                 *   flip,
                 *   cx: left of the thumb,
                 *   cy: top of the thumb,
                 *   cs: size of the thumb
                 * }
                 *
                 * Other attributes are not important.
                 */

                // first 30 best results
                result.sort((a, b) => a.match - b.match);
                this.result = result.slice(0, Math.min(result.length, 30));

                this.collapse = true;
            },
            show(item) {
                this.currentImage = item;
                this.showLarge = true;
            }
        },
        mounted() {
            // load all photos asynchronously
            this.loading = true;
            import('../data')
                .then(({default: data}) => {
                    const tags = {};
                    data.forEach(item => {
                        item.tags && item.tags.forEach(tag => tags[tag] = tag);
                    });

                    this.data = data;
                    this.tags = Object.keys(tags).sort();
                })
                .finally(() => {
                    this.loading = false;
                });
        }
    }
</script>

<style lang="scss" scoped>
    .wrapper {
        display: flex;
        align-items: flex-start;
        width: 100%;
        height: 100%;
        box-sizing: border-box;
        padding: 20px;

        .slider-wrapper {
            display: flex;
            line-height: 36px;

            .prefix, .postfix {
                display: inline-block;
                vertical-align: middle;
                min-width: 2.5em;
                text-align: center;
            }

            .slider {
                flex: 1;
                vertical-align: middle;
            }
        }

        .column-1 {
            flex: 0 0 360px;
            margin-right: 10px;
            width: 360px;

            .collapse-handler {
                display: none;
            }
        }

        .column-2 {
            flex: 1 1;
            height: 100%;

            .inner-wrapper {
                width: 100%;
                height: 100%;
                box-sizing: border-box;
                border: 1px solid #d9d9d9;
                border-radius: 4px;
                padding: 10px;
                overflow-y: scroll;

                .item {
                    margin: 5px;
                    cursor: zoom-in;
                }
            }
        }
    }

    @media screen and (max-height: 480px) {
        .wrapper {
            padding: 10px !important;
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

            .column-1 {
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

            .column-2 {
                box-sizing: border-box;
                padding: 10px;
            }
        }
    }
</style>
