import {APP_NAME} from '../config';
import {flickrSearch, getFlickrId} from './flickr';
import {unsplashGetPhoto, unsplashSearchPhotos} from './unsplash';

export type DataRecord = {
    rx: number,
    ry: number,
    rz: number,
    url: string,
    cx: number,
    cy: number,
    cs: number,
    w: number,
    h: number,
    tags: string[],
    id?: string,
    au?: string,
    src?: string,
};

export type PhotoSourceType = 'Flickr' | 'Unsplash' | 'unknown';

export function getPhotoSourceType(url: string): PhotoSourceType {
    url = url.toLowerCase();
    if (url.includes('flickr')) {
        return 'Flickr';
    }
    if (url.includes('unsplash')) {
        return 'Unsplash';
    }
    return 'unknown';
}

export type PhotoSearchResultPage = {
    page: number;
    totalPages: number;
    photos: {
        id: string;
        thumb: string;
        regular: string;
    }[];
};

export async function searchPhotos(
    type: PhotoSourceType,
    apiKey: string,
    keywords: string,
    pageSize: number,
    page: number,
): Promise<PhotoSearchResultPage> {
    switch (type) {
        case 'Flickr': {
            const res = await flickrSearch(apiKey, keywords, pageSize, page);
            return {
                page: res.page,
                totalPages: res.pages,
                photos: res.photos.map(photo => ({
                    id: photo.id,
                    thumb: photo.thumb,
                    regular: photo.large
                }))
            };
        }
        case 'Unsplash': {
            const res = await unsplashSearchPhotos(apiKey, keywords, pageSize, page);
            return {
                page: page,
                totalPages: res.pages,
                photos: res.photos.map(photo => ({
                    id: photo.id,
                    thumb: photo.urls.thumb,
                    regular: photo.urls.regular,
                }))
            };
        }
    }
    return {
        page: 0,
        totalPages: 0,
        photos: []
    };
}

export type PhotoAuthorInfo = {
    id: string;
    author: string;
    source: string;
}

export async function getPhotoAuthorInfo(type: PhotoSourceType, apiKey: string, id: string): Promise<PhotoAuthorInfo> {
    switch (type) {
        case 'Flickr':
            return {id, author: '', source: ''};
        case 'Unsplash': {
            const photoInfo = await unsplashGetPhoto(apiKey, id);
            return {
                id,
                author: photoInfo.author.name,
                source: photoInfo.author.username,
            };
        }
    }
    return {id, author: '', source: ''};
}

export function getPhotoAuthorLink(type: PhotoSourceType, id: string, source: string) {
    switch (type) {
        case 'Flickr':
            return `https://www.flickr.com/photo.gne?id=${id}`;
        case 'Unsplash':
            return `https://unsplash.com/@${source}?utm_source=${APP_NAME}&utm_medium=referral`;
    }
    return source;
}

export function getPhotoId(record: DataRecord) {
    switch (getPhotoSourceType(record.url)) {
        case 'Flickr':
            return getFlickrId(record.url);
        case 'Unsplash':
            return record.id;
    }
    return '';
}

export function getSourceLink(sourceType: PhotoSourceType) {
    switch (sourceType) {
        case 'Flickr':
            return 'https://www.flickr.com/';
        case 'Unsplash':
            return `https://unsplash.com/?utm_source=${APP_NAME}&utm_medium=referral`;
    }
    return null;
}