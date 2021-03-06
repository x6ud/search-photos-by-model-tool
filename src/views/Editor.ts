import Vue from 'vue'
import Axios from 'axios'
import {message, Modal} from 'ant-design-vue'

import ModelViewer from '../components/ModelViewer.vue'
import DataDistribution from '../components/DataDistribution.vue'
import ImageClip from '../components/ImageClip.vue'
import ThumbList from '../components/ThumbList.vue'

import {FlickrSearchResult, flickrSearch, getFlickrId} from '../utils/flickr'
import isImageExists from '../utils/is-image-exists'

import models from '../models'
import data from '../data'

type Model = { name: string, path: string, origin: string };
type DataRecord = {
    rx: number,
    ry: number,
    rz: number,
    url: string,
    cx: number,
    cy: number,
    cs: number,
    w: number,
    h: number,
    tags: string[]
};

const LOCAL_STORAGE_KEY__FLICKER_API_KEY = 'flicker-api-key';

const api = Axios.create({baseURL: '/server'});

async function loadFileList(): Promise<string[]> {
    return (await api.get('/dataList')).data.map((filename: string) => filename.slice(0, filename.lastIndexOf('.json'))) as string[];
}

async function loadJsonFile(filename: string): Promise<DataRecord[]> {
    return (await api.get('/data', {params: {name: filename}})).data as DataRecord[];
}

async function saveJsonFile(filename: string, data: any) {
    await api.post(
        '/data',
        JSON.stringify(data),
        {
            params: {name: filename},
            headers: {'Content-Type': 'text/plain'}
        }
    );
}

const existedPhotoIds: Set<string> = new Set();
data.forEach(record => {
    const id = getFlickrId(record.url);
    if (id) {
        existedPhotoIds.add(id);
    }
});

export default class Editor extends Vue.extend({
    components: {ModelViewer, DataDistribution, ImageClip, ThumbList},
    data() {
        return {
            modelViewerSize: 300,
            models: models as Model[],
            data: data as DataRecord[],
            model: {
                url: models[0].path,
                rotateX: 0,
                rotateY: 0,
                rotateZ: 0,
                zoom: 10,
            },
            dataDistributionFilterTag: '',
            search: {
                perPage: 100,
                apiKey: '',
                keywords: '',
                loading: false,
                result: {page: 0, pages: 0, perPage: 0, total: 0, photos: []} as FlickrSearchResult,
                actualIndex: -1,
                currentPage: 1,
                currentIndex: -1,
                lastKeywords: ''
            },
            clip: {
                imageUrl: '',
                tags: [] as string[],
                width: 0,
                height: 0,
                clipLeft: 0,
                clipTop: 0,
                clipSize: 0
            },
            file: {
                files: [] as string[],
                filename: '',
                data: [] as DataRecord[],
                selectedIndex: -1,
            },
            check: {
                checking: false,
                progress: 0,
                total: 0,
                filename: ''
            }
        };
    },
    watch: {
        'search.apiKey'(val) {
            localStorage.setItem(LOCAL_STORAGE_KEY__FLICKER_API_KEY, val);
        },
        async 'file.filename'(filename) {
            if (this.file.files.includes(filename)) {
                this.file.data = await loadJsonFile(filename + '.json');
                this.file.selectedIndex = -1;
                this.clip.tags = [];
            }
        },
        'clip.imageUrl'(url) {
            const id = getFlickrId(url);
            if (id) {
                this.thumbListSelect(this.file.data.findIndex(record => getFlickrId(record.url) === id));
            }
        },
    },
    computed: {
        tags(): { [tag: string]: number } {
            const map: { [tag: string]: number } = {};
            this.data.forEach(record => record.tags.forEach(tag => {
                map[tag] = (map[tag] || 0) + 1;
            }));
            return map;
        },
        dataWithTag(): DataRecord[] {
            return this.data.filter(photo => photo.tags.includes(this.dataDistributionFilterTag));
        },
        currentSearchResultNo(): number {
            return (Math.max(1, this.search.result.page) - 1) * this.search.perPage + this.search.actualIndex + 1;
        }
    },
    async mounted() {
        this.search.apiKey = localStorage.getItem(LOCAL_STORAGE_KEY__FLICKER_API_KEY) || '';
        this.file.files = (await loadFileList());
    },
    methods: {
        async searchFlickr() {
            try {
                this.search.loading = true;
                this.search.result = await flickrSearch(this.search.apiKey, this.search.keywords, this.search.perPage, this.search.currentPage);
                this.search.lastKeywords = this.search.keywords;
                this.search.actualIndex = this.search.currentIndex;
            } finally {
                this.search.loading = false;
            }
        },
        async moveSearchWindow(index: number) {
            if (this.search.lastKeywords !== this.search.keywords) {
                this.search.currentPage = 1;
                this.search.currentIndex = 0;
                await this.searchFlickr();
                return true;
            }
            let page = this.search.currentPage;
            if (index < 0) {
                index = this.search.perPage - 1;
                page -= 1;
            } else if (index >= this.search.result.perPage) {
                index = 0;
                page += 1;
            } else {
                this.search.actualIndex = this.search.currentIndex = index;
                return true;
            }
            if (page < 0 || page > this.search.result.pages) {
                return false;
            }
            this.search.currentIndex = index;
            this.search.currentPage = page;
            await this.searchFlickr();
            return true;
        },
        async getOne(indexStep: number) {
            for (; ;) {
                if (await this.moveSearchWindow(this.search.currentIndex + indexStep)) {
                    const imageUrl = this.search.result.photos[this.search.currentIndex]?.large || '';
                    const id = getFlickrId(imageUrl);
                    if (!(id && existedPhotoIds.has(id))) {
                        this.clip.imageUrl = imageUrl;
                        break;
                    }
                    if (!id) {
                        break;
                    }
                } else {
                    break;
                }
            }
        },
        getPrevOne() {
            return this.getOne(-1);
        },
        getNextOne() {
            return this.getOne(1);
        },
        saveRecord() {
            const imageUrl = this.clip.imageUrl;
            const id = getFlickrId(imageUrl);
            let record = id && this.file.data.find(item => getFlickrId(item.url) === id) || null;
            if (!record) {
                record = {
                    rx: 0,
                    ry: 0,
                    rz: 0,
                    url: '',
                    cx: 0,
                    cy: 0,
                    cs: 0,
                    w: 0,
                    h: 0,
                    tags: []
                };
                this.file.data.push(record);
            }
            record.url = this.clip.imageUrl;
            record.tags = [...this.clip.tags];
            record.w = this.clip.width;
            record.h = this.clip.height;
            record.cx = this.clip.clipLeft;
            record.cy = this.clip.clipTop;
            record.cs = this.clip.clipSize;
            record.rx = this.model.rotateX;
            record.ry = this.model.rotateY;
            record.rz = this.model.rotateZ;
            this.file.selectedIndex = this.file.data.indexOf(record);
        },
        thumbListSelect(index: number) {
            this.file.selectedIndex = index;
            const record = this.file.data[index];
            if (record) {
                this.clip.imageUrl = record.url;
                this.clip.tags = [...record.tags];
                this.clip.width = record.w;
                this.clip.height = record.h;
                this.clip.clipLeft = record.cx;
                this.clip.clipTop = record.cy;
                this.clip.clipSize = record.cs;
                this.model.rotateX = record.rx;
                this.model.rotateY = record.ry;
                this.model.rotateZ = record.rz;
            }
        },
        thumbListRemove(index: number) {
            Modal.confirm({
                title: 'Are you sure you want to delete?',
                onOk: () => {
                    this.file.data.splice(index, 1);
                    if (this.file.selectedIndex === index) {
                        this.file.selectedIndex = -1;
                    }
                }
            });
        },
        createNew() {
            if (this.file.data.length) {
                Modal.confirm({
                    title: 'Are you sure you want to create a new list?',
                    onOk: () => {
                        this.file.selectedIndex = -1;
                        this.file.data = [];
                        this.clip.tags = [];
                        if (this.file.files.includes(this.file.filename)) {
                            this.file.filename = '';
                        }
                    }
                });
            }
        },
        async saveJson() {
            await saveJsonFile(this.file.filename + '.json', this.file.data);
            message.success('Saved.');
        },
        async auditCurrentList() {
            this.file.data = await this.auditPictures(this.file.data, this.file.filename);
        },
        async auditAll() {
            const allFiles = await loadFileList();
            for (const filename of allFiles) {
                const content = await loadJsonFile(filename + '.json');
                const newContent = await this.auditPictures(content, filename);
                if (content.length !== newContent.length) {
                    await saveJsonFile(filename + '.json', newContent);
                }
            }
        },
        async auditPictures(content: DataRecord[], filename: string): Promise<DataRecord[]> {
            const invalid: DataRecord[] = [];
            this.check.filename = filename;
            this.check.progress = 0;
            this.check.total = content.length;
            if (this.check.total < 1) {
                return content;
            }
            this.check.checking = true;
            const promises = content.map(async item => {
                if (!(await isImageExists(item.url))) {
                    invalid.push(item);
                }
                this.check.progress += 1;
                if (this.check.progress === this.check.total) {
                    this.check.checking = false;
                }
            });
            await Promise.all(promises);
            message.success(`${filename}: ${invalid.length} removed.`);
            return content.filter(item => !invalid.includes(item));
        }
    }
}) {
}
