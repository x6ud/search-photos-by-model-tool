import {message, Modal} from 'ant-design-vue';
import Axios from 'axios';
import Vue from 'vue';
import DataDistribution from '../components/DataDistribution.vue';
import ImageClip from '../components/ImageClip.vue';
import ModelViewer from '../components/ModelViewer.vue';
import ThumbList from '../components/ThumbList.vue';
import data from '../data';
import models from '../models';
import isImageExists from '../utils/is-image-exists';
import {
    DataRecord,
    getPhotoAuthorInfo,
    getPhotoId,
    PhotoSearchResultPage,
    PhotoSourceType,
    searchPhotos
} from '../utils/photo';


const LOCAL_STORAGE_KEY__FLICKER_API_KEY = 'flicker-api-key';
const LOCAL_STORAGE_KEY__UNSPLASH_ACCESS_KEY = 'unsplash-access-key';

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

export default class Editor extends Vue.extend({
    components: {ModelViewer, DataDistribution, ImageClip, ThumbList},
    data() {
        return {
            models,
            model: {
                url: models[0].path,
                rotateX: 0,
                rotateY: 0,
                rotateZ: 0,
                zoom: 10,
            },
            photoSourceOptions: ['Flickr', 'Unsplash'] as PhotoSourceType[],
            photoSource: 'Unsplash' as PhotoSourceType,
            apiKey: '',
            keywords: '',
            searchLoading: false,
            page: {
                page: 1,
                totalPages: 0,
                photos: [],
            } as PhotoSearchResultPage,
            clip: {
                imageUrl: '',
                tags: [] as string[],
                width: 0,
                height: 0,
                clipLeft: 0,
                clipTop: 0,
                clipSize: 0,
                author: '',
                source: '',
                id: '',
            },
            filename: '',
            files: [] as string[],
            records: [] as DataRecord[],
            recordIndex: -1,
            check: {
                checking: false,
                progress: 0,
                total: 0,
                filename: ''
            },
            dataDistributionFilterTag: '',
        };
    },
    watch: {
        photoSource: {
            handler(val: PhotoSourceType) {
                switch (val) {
                    case 'Flickr':
                        this.apiKey = localStorage.getItem(LOCAL_STORAGE_KEY__FLICKER_API_KEY) || '';
                        break;
                    case 'Unsplash':
                        this.apiKey = localStorage.getItem(LOCAL_STORAGE_KEY__UNSPLASH_ACCESS_KEY) || '';
                        break;
                    default:
                        this.apiKey = '';
                        break;
                }
            },
            immediate: true,
        },
        apiKey(val: string) {
            switch (this.photoSource) {
                case 'Flickr':
                    localStorage.setItem(LOCAL_STORAGE_KEY__FLICKER_API_KEY, val);
                    break;
                case 'Unsplash':
                    localStorage.setItem(LOCAL_STORAGE_KEY__UNSPLASH_ACCESS_KEY, val);
                    break;
            }
        },
        async filename(filename) {
            if (this.files.includes(filename)) {
                this.records = await loadJsonFile(filename + '.json');
                this.recordIndex = -1;
                this.clip.tags = [];
            }
        },
    },
    computed: {
        tags(): { [tag: string]: number } {
            const map: { [tag: string]: number } = {};
            data.forEach(record => record.tags.forEach(tag => {
                map[tag] = (map[tag] || 0) + 1;
            }));
            return map;
        },
        dataWithTag(): DataRecord[] {
            return data.filter(photo => photo.tags.includes(this.dataDistributionFilterTag));
        },
    },
    async mounted() {
        this.files = await loadFileList();
    },
    methods: {
        async search(page: number) {
            if (!this.keywords) {
                return;
            }
            try {
                this.searchLoading = true;
                this.page.photos = [];
                this.page = await searchPhotos(
                    this.photoSource,
                    this.apiKey,
                    this.keywords,
                    20,
                    page || 1
                );
            } finally {
                this.searchLoading = false;
            }
        },
        async prevPage() {
            const page = Math.max(1, this.page.page - 1);
            if (page === this.page.page) {
                return;
            }
            await this.search(page);
        },
        async nextPage() {
            const page = Math.min(this.page.totalPages, this.page.page + 1);
            if (page === this.page.page) {
                return;
            }
            await this.search(page);
        },
        async selectPhoto(photo: { id: string, thumb: string, regular: string }) {
            const recordIndex = photo.id ? this.records.findIndex(record => getPhotoId(record) === photo.id) : -1;
            if (recordIndex >= 0) {
                this.selectRecord(recordIndex);
            } else {
                this.clip.id = photo.id;
                this.clip.imageUrl = photo.regular;
                const authorInfo = await getPhotoAuthorInfo(this.photoSource, this.apiKey, photo.id);
                this.clip.author = authorInfo.author;
                this.clip.source = authorInfo.source;
            }
        },
        addToList() {
            const id = this.clip.id;
            let record = id && this.records.find(item => getPhotoId(item) === id) || null;
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
                    tags: [],
                };
                this.records.push(record);
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
            record.au = this.clip.author;
            record.src = this.clip.source;
            record.id = this.clip.id;
            this.recordIndex = this.records.indexOf(record);
        },
        selectRecord(index: number) {
            this.recordIndex = index;
            const record = this.records[index];
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
                this.clip.author = record.au || '';
                this.clip.source = record.src || '';
                this.clip.id = record.id || '';
            }
        },
        removeRecord(index: number) {
            Modal.confirm({
                title: 'Are you sure you want to delete?',
                onOk: () => {
                    this.records.splice(index, 1);
                    if (this.recordIndex === index) {
                        this.recordIndex = -1;
                    }
                }
            });
        },
        createNew() {
            if (this.records.length) {
                Modal.confirm({
                    title: 'Are you sure you want to create a new list?',
                    onOk: () => {
                        this.recordIndex = -1;
                        this.records = [];
                        this.clip.tags = [];
                        this.clip.id = '';
                        if (this.files.includes(this.filename)) {
                            this.filename = '';
                        }
                    }
                });
            }
        },
        async saveJson() {
            await saveJsonFile(this.filename + '.json', this.records);
            message.success('Saved.');
        },
        async auditCurrentList() {
            this.records = await this.auditPictures(this.records, this.filename);
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
        },
    }
}) {
}