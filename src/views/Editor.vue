<template>
    <div class="editor">
        <div class="column">
            <div class="row">
                <a-select v-model="model.url"
                          style="flex: 1 1; min-width: 0;"
                >
                    <a-select-option v-for="model in models"
                                     :key="model.path"
                                     :value="model.path"
                    >
                        {{model.name}}
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
                <div class="model-position">
                    <div>X: {{model.rotateX}}°</div>
                    <div>Y: {{model.rotateY}}°</div>
                    <div>Z: {{model.rotateZ}}°</div>
                </div>
            </model-viewer>

            <div class="model-controls">
                <a-slider class="slider"
                          :included="false"
                          v-model="model.rotateZ"
                          :min="-180"
                          :max="180"/>
                <a-button @click="model.rotateX = model.rotateY = model.rotateZ = 0"
                          size="small"
                >
                    Reset
                </a-button>
            </div>

            <h4>Direction Distribution:</h4>
            <div class="row">
                <a-select v-model="dataDistributionFilterTag"
                          style="flex: 1 1; min-width: 0"
                >
                    <a-select-option v-for="(num, tag) in tags" :key="tag">{{tag}} ({{num}})</a-select-option>
                </a-select>
            </div>
            <data-distribution :width="modelViewerSize"
                               :height="modelViewerSize"
                               :data="dataWithTag"
            />
        </div>

        <div class="column">
            <div class="row">
                <a-input v-model="search.apiKey" placeholder="Flickr API Key"
                         style="width: 140px"
                         title="Flicker API Key"
                >
                    <a-icon slot="prefix" type="lock"/>
                </a-input>
                <a-input v-model="search.keywords"
                         placeholder="Search Keywords"
                         style="flex: 1 1"
                         :disabled="!search.apiKey"
                />
                <a-button-group>
                    <a-button @click="getPrevOne"
                              :disabled="!(search.apiKey && search.keywords && (search.currentIndex > 0 || search.currentPage > 1))"
                              icon="left"
                              title="Get Prev Image"
                    />
                    <a-button @click="getNextOne"
                              :disabled="!(search.apiKey && search.keywords)"
                              :loading="search.loading"
                              title="Get Next Image"
                    >
                        Get One
                        <template v-if="search.result.total">
                            ({{currentSearchResultNo}}/{{search.result.total}})
                        </template>
                    </a-button>
                </a-button-group>
            </div>
            <div class="row">
                <a-input placeholder="Image Url" v-model="clip.imageUrl"
                         style="flex: 1 1; min-width: 0;"
                />
                <a-button icon="check"
                          title="Save to List"
                          @click="saveRecord"
                          :disabled="!(clip.imageUrl && clip.tags && clip.tags.length)"
                />
            </div>
            <div class="row">
                <a-select mode="tags" v-model="clip.tags"
                          placeholder="Tags"
                          style="flex: 1 1; min-width: 0;"
                />
            </div>
            <div class="row">
                <image-clip :image-url="clip.imageUrl"
                            :image-width.sync="clip.width"
                            :image-height.sync="clip.height"
                            :clip-left.sync="clip.clipLeft"
                            :clip-top.sync="clip.clipTop"
                            :clip-size.sync="clip.clipSize"
                            style="width: 600px; height: 420px"
                />
            </div>
        </div>

        <div class="column">
            <div class="row" style="width: 240px">
                <a-auto-complete v-model="file.filename"
                                 :data-source="file.files"
                                 placeholder="Filename"
                                 style="flex: 1 1; min-width: 0;"
                />
                <a-button icon="file"
                          title="New"
                          @click="createNew"
                />
                <a-button icon="save"
                          title="Save .json File"
                          @click="saveJson"
                          :disabled="!file.filename"
                />
            </div>
            <div class="row" style="flex: 1 1; min-height: 0;">
                <thumb-list :images="file.data"
                            :active="file.selectedIndex"
                            @select="thumbListSelect"
                            @remove="thumbListRemove"
                            ref="thumbList"
                />
            </div>
            <div class="row">
                <div style="flex: 1 1; min-width: 0; text-align: right;">
                    Total: {{file.data.length}}
                </div>
            </div>
            <div class="row">
                <a-button @click="auditCurrentList" style="width: 100%"
                          :disabled="check.checking"
                          title="Remove missing images from current list"
                >
                    <template v-if="check.checking && check.filename === file.filename">
                        {{check.progress}} / {{check.total}}
                    </template>
                    <template v-else>
                        Audit Current List
                    </template>
                </a-button>
            </div>
            <div class="row">
                <a-button @click="auditAll" style="width: 100%"
                          :disabled="check.checking"
                          title="Remove missing images from all files"
                >
                    <template v-if="check.checking">
                        {{check.filename}}: {{check.progress}} / {{check.total}}
                    </template>
                    <template v-else>
                        Audit All Files
                    </template>
                </a-button>
            </div>
        </div>
    </div>
</template>

<script lang="ts" src="./Editor.ts"></script>

<style lang="scss" scoped>
    .editor {
        display: flex;
        width: 100%;
        height: 100%;
        box-sizing: border-box;
        padding: 10px;

        & > .column {
            display: flex;
            flex-direction: column;

            &:not(:last-child) {
                margin-right: 10px;
            }

            .row {
                display: flex;
                width: 100%;

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

        .model-viewer {
            .model-position {
                position: absolute;
                left: 8px;
                top: 8px;
                user-select: none;
                pointer-events: none;
                font-size: 12px;
            }
        }

        .model-controls {
            display: flex;
            align-items: center;

            .slider {
                flex: 1 1;
                min-width: 0;
            }
        }

        .image-clip {
            width: 100%;
        }
    }
</style>
