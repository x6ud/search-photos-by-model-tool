<template>
    <div class="wrapper">
        <div class="column-1" style="width: 360px;">
            <a-select v-model="model" style="width: 100%; margin-bottom: 8px;">
                <a-select-option v-for="option in models"
                                 :key="option.path"
                                 :value="option.path"
                >
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
            />

            <div class="slider-wrapper">
                <span class="prefix">X: {{rotateX}}; Y: {{rotateY}}; Z: </span>
                <a-slider class="slider" :included="false"
                          v-model="rotateZ" :min="-180" :max="180"/>
                <div class="postfix">
                    <span style="width: 2.5em; text-align: center; display: inline-block;">{{rotateZ}}</span>
                    <a-button @click="rotateX = rotateY = rotateZ = 0" size="small">Reset</a-button>
                </div>
            </div>
        </div>

        <div class="column-2">
            <div class="toolbar" v-if="!apiFromEnv">
                <a-input v-model="apiKey"  placeholder="Paste your Flickr API key here to enable inline search" style="margin-bottom: 8px; margin-right: 8px;"/>
            </div>
            <div class="toolbar" v-if="apiKey" style="border-style:solid; border-color:#E79191; border-radius:5px; padding-top:7px; padding-left:4px; margin-bottom:5px;">
                <a-input v-model="searchTags"
                    placeholder="Flickr Search Tags"
                    style="margin-bottom: 8px; margin-right: 8px;"
                />
                <a-button @click="searchFlickr" style="margin-right: 8px">Search!</a-button>
                <a-button @click="paginateSearch" style="margin-right: 8px">Fetch page {{currentPage + 1}}</a-button>
            </div>
            <div v-if=lastSearchError >
                <div style="font-color:red;">{{lastSearchError}}</div>
            </div>
            <div class="toolbar">
                <a-input v-model="imageUrl"
                         placeholder="Input image url"
                         style="margin-bottom: 8px; margin-right: 8px;"
                />
                <a-button @click="getOne" style="margin-right: 8px">Get One ({{unregistered.length}})</a-button>
                <a-button @click="save">Save</a-button>
            </div>

            <a-select mode="tags" v-model="tags"
                      placeholder="Input tags"
                      style="width: 100%; margin-bottom: 8px;"></a-select>

            <div class="image-clip" style="height: 428px;">
                <div class="side">
                    <div class="small">
                        <img v-if="imageUrl" :src="imageUrl" alt="" :style="smallImageStyle">
                    </div>
                    <div class="slider-wrapper">
                        <span class="prefix">Size</span>
                        <a-slider class="slider" :included="false" v-model="imageClip.size" :min="0"
                                  :max="imageClipMaxSize"/>
                    </div>
                </div>

                <div class="main" ref="imageClipLarge">
                    <div class="large" @mousemove="imageClipDragMove">
                        <a-spin :spinning="imageLoading">
                            <div class="image" v-if="imageUrl" :style="imageStyle"></div>
                        </a-spin>
                        <div class="image-clip" v-if="imageUrl" :style="imageClipStyle"
                             @mousedown="imageClipDragStart">
                        </div>
                    </div>
                    <div class="slider-wrapper" style="width: 100%;">
                        <span class="prefix">Zoom</span>
                        <a-slider class="slider" :included="false" v-model="imageZoom" :min="10" :max="100"/>
                    </div>
                </div>
            </div>
        </div>

        <div class="column-3">
            <div style="width: 100%; margin-bottom: 8px; text-align: right;">
                <span style="margin-right: 8px">{{data.length}}</span>
                <a-button size="small" style="margin-right: 8px;" @click="importData()">Import</a-button>
                <a-button size="small" @click="exportData()">Export</a-button>
            </div>
            <div class="list">
                <image-thumb v-for="item in latestRecords"
                             :key="item.url"
                             :image="item"
                             class="item" @click.native="load(item)">
                    <span class="btn-remove" @click="remove(item)"><a-icon type="close"/></span>
                </image-thumb>
            </div>
        </div>
    </div>
</template>

<script>
    import ModelViewer from '../components/ModelViewer.vue'
    import ImageThumb from '../components/ImageThumb.vue'

    import models from '../models'
    import photos from '../photos'
    import searchResults from '../rawSearch'

    import getFlickrId from '../get-flickr-id'
    import rawSearch from '../rawSearch';

    const THUMB_SIZE = 160;
    const STORAGE_KEY = 'ars-data';

    function copyToClipboard(text) {
        if (window.clipboardData && window.clipboardData.setData) {
            return clipboardData.setData("Text", text);
        } else if (document.queryCommandSupported && document.queryCommandSupported("copy")) {
            const textarea = document.createElement("textarea");
            textarea.textContent = text;
            textarea.style.position = "fixed";
            document.body.appendChild(textarea);
            textarea.select();
            try {
                return document.execCommand("copy");
            } catch (ex) {
                return false;
            } finally {
                document.body.removeChild(textarea);
            }
        }
    }

    function getUrlHash(url) {
        return getFlickrId(url) || url;
    }

    function convertToURLs(searchResults){
        return searchResults.map(r => `https://farm${r.farm}.staticflickr.com/${r.server}/${r.id}_${r.secret}.jpg`);
    } 

    export default {
        components: {ModelViewer, ImageThumb},
        data() {
            return {
                models: models,
                model: models[0].path,
                rotateX: 0,
                rotateY: 0,
                rotateZ: 0,
                zoom: 10,
                imageUrl: '',
                searchTags:'',
                lastSearchError: null,
                apiKey:null,
                apiFromEnv: false,
                currentPage: 1,
                imageZoom: 100,
                imageWidth: 0,
                imageHeight: 0,
                imageLoading: false,
                existed: {},
                imageClip: {
                    left: 0,
                    top: 0,
                    size: 0,
                    dragging: false,
                    dragX: 0,
                    dragY: 0
                },
                tags: [],
                // photos saved in local storage
                data: [],
                // photos listed in photos.js and not yet added to data or local storage
                unregistered: []
            };
        },
        computed: {
            imageStyle() {
                return {
                    background: `url(${this.imageUrl}) 0 0 / 100% 100% no-repeat`,
                    width: this.imageWidth * this.imageZoom / 100 + 'px',
                    height: this.imageHeight * this.imageZoom / 100 + 'px',
                };
            },
            imageClipStyle() {
                return {
                    left: this.imageClip.left * this.imageZoom / 100 + 'px',
                    top: this.imageClip.top * this.imageZoom / 100 + 'px',
                    width: this.imageClip.size * this.imageZoom / 100 + 'px',
                    height: this.imageClip.size * this.imageZoom / 100 + 'px'
                };
            },
            imageClipMaxSize() {
                return Math.min(this.imageWidth, this.imageHeight);
            },
            smallImageStyle() {
                const scale = 1 / this.imageClip.size * THUMB_SIZE;
                return {
                    position: 'absolute',
                    width: this.imageWidth * scale + 'px',
                    height: this.imageHeight * scale + 'px',
                    left: -this.imageClip.left * scale + 'px',
                    top: -this.imageClip.top * scale + 'px'
                };
            },
            latestRecords() {
                return this.data.length > 10 ? this.data.slice(this.data.length - 10) : this.data;
            }
        },
        watch: {
            imageUrl: {
                immediate: true,
                handler(url) {
                    if (!url) {
                        return;
                    }
                    this.imageLoading = true;
                    const image = new Image();
                    image.onload = () => {
                        this.imageLoading = false;
                        this.imageWidth = image.width;
                        this.imageHeight = image.height;

                        this.imageClip.size = Math.min(image.width, image.height, this.imageClip.size);
                        this.imageZoom =
                            Math.min(
                                image.width,
                                image.height,
                                this.$refs.imageClipLarge.clientWidth - 18,
                                this.$refs.imageClipLarge.clientHeight - 18 - 32
                            )
                            / image.width * 100 | 0;
                    };
                    image.src = url;
                }
            },
            ['imageClip.size'](size) {
                this.imageClip.left = Math.min(this.imageClip.left, this.imageWidth - size);
                this.imageClip.top = Math.min(this.imageClip.top, this.imageHeight - size);
            }
        },
        methods: {
            imageClipDragStart(e) {
                if (e.button === 0) {
                    this.imageClip.dragging = true;
                    this.imageClip.dragX = e.clientX;
                    this.imageClip.dragY = e.clientY;
                }
            },
            imageClipDragStop() {
                this.imageClip.dragging = false;
            },
            imageClipDragMove(e) {
                const x0 = this.imageClip.dragX,
                    y0 = this.imageClip.dragY,
                    x1 = e.clientX,
                    y1 = e.clientY;

                this.imageClip.dragX = x1;
                this.imageClip.dragY = y1;

                if (!this.imageClip.dragging) {
                    return;
                }
                const dx = x1 - x0,
                    dy = y1 - y0;
                this.imageClip.left += dx / (this.imageZoom / 100);
                this.imageClip.left = Math.max(0, Math.min(this.imageWidth - this.imageClip.size, this.imageClip.left));
                this.imageClip.top += dy / (this.imageZoom / 100);
                this.imageClip.top = Math.max(0, Math.min(this.imageHeight - this.imageClip.size, this.imageClip.top));
            },
            save() {
                if (!this.imageUrl) {
                    return;
                }
                const data = {
                    rx: this.rotateX,
                    ry: this.rotateY,
                    rz: this.rotateZ,
                    url: this.imageUrl,
                    cx: this.imageClip.left | 0,
                    cy: this.imageClip.top | 0,
                    cs: this.imageClip.size,
                    w: this.imageWidth,
                    h: this.imageHeight,
                    tags: this.tags
                };
                const existed = this.data.findIndex(elem => elem.url === data.url);
                if (existed >= 0) {
                    this.data[existed] = data;
                } else {
                    this.data.push(data);
                }
                window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
                // this.$notification.success({message: 'Saved successfully.', placement: 'topLeft', duration: 2});
            },
            load(item) {
                this.rotateX = item.rx;
                this.rotateY = item.ry;
                this.rotateZ = item.rz;
                this.imageUrl = item.url;
                this.imageWidth = item.w;
                this.imageHeight = item.h;
                this.imageClip.left = item.cx;
                this.imageClip.top = item.cy;
                this.imageClip.size = item.cs;
                this.tags = item.tags;
            },
            remove(item) {
                if (window.confirm(`Are you sure you want to delete ${item.url}?`)) {
                    this.data.splice(this.data.findIndex(curr => curr === item), 1);
                    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
                    // this.$notification.success({
                    //     message: 'Deleted successfully.',
                    //     placement: 'topLeft',
                    //     duration: 2
                    // });
                }
            },
            importData() {
                const json = window.prompt("Input Data JSON:");
                if (json) {
                    this.data = JSON.parse(json);
                    window.localStorage.setItem(STORAGE_KEY, json);
                    // this.$notification.success({
                    //     message: 'Records were imported successfully.',
                    //     placement: 'topLeft',
                    //     duration: 2
                    // });
                }
            },
            exportData() {
                copyToClipboard(JSON.stringify(this.data));
                // this.$notification.success({
                //     message: 'Records were exported to clipboard.',
                //     placement: 'topLeft',
                //     duration: 2
                // });
            },
            getOne() {
                this.imageUrl = this.unregistered.shift();
            },
            searchFlickr(){
                fetch(`https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=${this.apiKey}&license=2%2C3%2C4%2C5%2C6%2C9&format=json&nojsoncallback=1&tags=${this.searchTags}&page=${this.currentPage}`)
                    .then(response =>{
                            if(response.ok){                                
                                return response.json();
                            }
                            throw new Error(`The request failed: ${response.body}`);
                        }
                    )
                    .then( body => {
                        console.log(body);
                        if(body.stat != "ok"){
                            throw new Error(`Flickr bounced the request: ${body.message}`)
                        }
                        return body;
                    })
                    .then((value) =>{
                            let storageData = localStorage.getItem(STORAGE_KEY);
                            storageData = storageData && JSON.parse(storageData) || [];

                            let urlsFromSearch = convertToURLs(value.photos.photo);
                            const searchUrls = urlsFromSearch.filter(url => !this.existed[getUrlHash(url)]);
                            
                            this.unregistered = [...searchUrls, ...this.unregistered];
                        }
                    ).catch((error)=>{
                        this.lastSearchError = error.message;
                        console.log(error.message);
                    });
            },
            paginateSearch() {
                this.currentPage++;
                this.searchFlickr();
            }

        },
        mounted() {
            window.addEventListener('mouseup', this.imageClipDragStop);

            import('../data')
                .then(({default: data}) => {
                    //load Flickr api key from env if able
                    if(process.env.VUE_APP_FLICKR_API && process.env.VUE_APP_FLICKR_API.length == 32){
                        this.apiFromEnv = true;
                        this.apiKey = process.env.VUE_APP_FLICKR_API;
                    }else{
                        console.log("Could not find env, allowing manual entry");
                    }

                    let storageData = localStorage.getItem(STORAGE_KEY);
                    storageData = storageData && JSON.parse(storageData) || [];

                    // remove duplicates
                    ([...storageData, ...data]).forEach(image => this.existed[getUrlHash(image.url)] = true);
                    let unregistered = photos.filter(photo => !this.existed[getUrlHash(photo)]);

                    let urlsFromSearch = convertToURLs(rawSearch);
                    const rawUnregistered = urlsFromSearch.filter(raw => !this.existed[getUrlHash(raw)]);
                    
                    this.data = storageData;
                    this.unregistered = [...rawUnregistered, ...unregistered];
                });
        },
        beforeDestroy() {
            window.removeEventListener('mouseup', this.imageClipDragStop);
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
        }

        .column-2 {
            margin-left: 10px;
            width: 600px;

            .toolbar {
                display: flex;
            }

            .image-clip {
                display: flex;
                align-items: flex-start;

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
                }
            }
        }

        .column-3 {
            flex: 0 0 187px;
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            margin-left: 10px;
            height: 508px;

            .list {
                flex: 1 1;
                width: 100%;
                box-sizing: border-box;
                border: 1px solid #d9d9d9;
                border-radius: 4px;
                padding: 10px;
                overflow-y: scroll;

                .item {
                    cursor: pointer;
                    margin: 5px;

                    .btn-remove {
                        position: absolute;
                        z-index: 1;
                        right: 8px;
                        top: 8px;
                        width: 18px;
                        height: 18px;
                        line-height: 18px;
                        border-radius: 100%;
                        text-align: center;
                        background-color: rgba(255, 255, 255, .5);
                    }
                }
            }
        }
    }
</style>
