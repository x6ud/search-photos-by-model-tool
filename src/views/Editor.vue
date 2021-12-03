<template>
    <div class="container cols">
        <div class="rows" style="width: 300px;">
            <a-select v-model="model.url"
                      show-search
                      size="small"
            >
                <a-select-option v-for="model in models"
                                 :key="model.path"
                                 :value="model.path"
                >
                    {{ model.name }}
                </a-select-option>
            </a-select>

            <model-viewer :model-url="model.url"
                          :rotate-x.sync="model.rotateX"
                          :rotate-y.sync="model.rotateY"
                          :rotate-z.sync="model.rotateZ"
                          :zoom.sync="model.zoom"
                          :width="300"
                          :height="300"
            />

            <div class="cols" style="align-items: center;">
                <a-slider class="fill"
                          :included="false"
                          v-model="model.rotateZ"
                          :min="-180"
                          :max="180"
                />
                <a-button @click="model.rotateX = model.rotateY = model.rotateZ = 0"
                          size="small"
                >
                    Reset
                </a-button>
            </div>

            <div>Direction Distribution</div>
            <a-select v-model="dataDistributionFilterTag"
                      show-search
                      size="small"
            >
                <a-select-option v-for="(num, tag) in tags" :key="tag">{{ tag }} ({{ num }})</a-select-option>
            </a-select>
            <data-distribution :width="300"
                               :height="300"
                               :data="dataWithTag"
            />
        </div>

        <div class="rows" style="width: 600px;">
            <div class="cols">
                <a-select v-model="photoSource"
                          style="width: 100px;"
                          size="small"
                >
                    <a-select-option v-for="option in photoSourceOptions"
                                     :key="option"
                                     :value="option"
                    >
                        {{ option }}
                    </a-select-option>
                </a-select>

                <a-input v-model="apiKey"
                         placeholder="API Key"
                         style="width: 120px"
                         size="small"
                >
                    <a-icon slot="prefix" type="lock"/>
                </a-input>

                <a-input-search v-model="keywords"
                                placeholder="Keywords"
                                class="fill"
                                size="small"
                                :disabled="!apiKey"
                                :loading="searchLoading"
                                @search="search(1)"
                />
            </div>

            <div class="cols" style="height: 114px;">
                <a-button icon="left" size="small" style="height: 100%;"
                          :disabled="page.page <= 1"
                          @click="prevPage"
                />

                <div class="photos-list fill" style="height: 100%;">
                    <div class="photo"
                         v-for="photo in page.photos"
                         :class="{active: photo.id === clip.id}"
                         @click="selectPhoto(photo)"
                    >
                        <img :src="photo.thumb" alt="">
                    </div>
                </div>

                <a-button icon="right" size="small" style="height: 100%;"
                          :disabled="page.page >= page.totalPages"
                          @click="nextPage"
                />
            </div>

            <image-clip :image-url="clip.imageUrl"
                        :image-width.sync="clip.width"
                        :image-height.sync="clip.height"
                        :clip-left.sync="clip.clipLeft"
                        :clip-top.sync="clip.clipTop"
                        :clip-size.sync="clip.clipSize"
                        style="width: 600px; height: 420px"
            />

            <div class="form-item cols">
                <label>ID: </label>
                <a-input size="small"
                         placeholder="ID"
                         class="fill"
                         v-model="clip.id"
                />
            </div>
            <div class="form-item cols">
                <label>URL: </label>
                <a-input size="small"
                         placeholder="Image URL"
                         class="fill"
                         v-model="clip.imageUrl"
                />
            </div>
            <div class="form-item cols">
                <label>Author: </label>
                <a-input size="small"
                         placeholder="Author"
                         class="fill"
                         v-model="clip.author"
                />
            </div>
            <div class="form-item cols">
                <label>Link: </label>
                <a-input size="small"
                         placeholder="Author link"
                         class="fill"
                         v-model="clip.source"
                />
            </div>
            <div class="form-item cols">
                <label>Tags: </label>
                <a-select mode="tags"
                          size="small"
                          placeholder="Tags"
                          class="fill"
                          v-model="clip.tags"
                />
            </div>

            <a-button :disabled="!(clip.imageUrl && clip.tags && clip.tags.length)"
                      type="primary"
                      @click="addToList"
                      size="small"
            >
                Save to List
            </a-button>
        </div>

        <div class="rows" style="width: 240px">
            <div class="cols">
                <a-auto-complete v-model="filename"
                                 :data-source="files"
                                 placeholder="Filename"
                                 class="fill"
                                 size="small"
                />
                <a-button icon="file"
                          title="New"
                          @click="createNew"
                          size="small"
                />
                <a-button icon="save"
                          title="Save .json File"
                          @click="saveJson"
                          :disabled="!filename"
                          size="small"
                />
            </div>

            <thumb-list class="fill"
                        :images="records"
                        :active="recordIndex"
                        @select="selectRecord"
                        @remove="removeRecord"
                        ref="thumbList"
            />

            <div style="font-size: 12px; text-align: right;">
                Total: {{ records.length }}
            </div>

            <a-button @click="auditCurrentList" style="width: 100%"
                      :disabled="check.checking"
                      title="Remove missing images from current list"
                      size="small"
            >
                <template v-if="check.checking && check.filename === filename">
                    {{ check.progress }} / {{ check.total }}
                </template>
                <template v-else>
                    Audit Current List
                </template>
            </a-button>

            <a-button @click="auditAll" style="width: 100%"
                      :disabled="check.checking"
                      title="Remove missing images from all files"
                      size="small"
            >
                <template v-if="check.checking">
                    {{ check.filename }}: {{ check.progress }} / {{ check.total }}
                </template>
                <template v-else>
                    Audit All Files
                </template>
            </a-button>
        </div>
    </div>
</template>

<script lang="ts" src="./Editor.ts"></script>

<style lang="scss" scoped>
.container {
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    padding: 4px;
}

.rows {
    display: flex;
    flex-direction: column;

    & > *:not(:last-child) {
        margin-bottom: 4px;
    }

    & > .fill {
        flex: 1 1;
        min-height: 0;
    }
}

.cols {
    display: flex;

    & > *:not(:last-child) {
        margin-right: 4px;
    }

    & > .fill {
        flex: 1 1;
        min-width: 0;
    }
}

.photos-list {
    box-sizing: border-box;
    border: 1px solid #d9d9d9;
    border-radius: 4px;
    padding: 4px;
    overflow: auto;

    .photo {
        display: flex;
        align-items: center;
        width: 50px;
        height: 50px;
        background: #f2f2f2;
        float: left;
        margin: 0 2px 2px 0;
        cursor: pointer;
        user-select: none;

        &.active {
            background: #1890ff;
        }

        img {
            max-width: 100%;
            max-height: 100%;
            margin: auto;
        }
    }
}

.form-item {
    align-items: center;
    font-size: 12px;

    label {
        min-width: 3.5em;
        text-align: right;
    }
}

.thumb-list {
    border: 1px solid #d9d9d9;
    border-radius: 4px;
}
</style>