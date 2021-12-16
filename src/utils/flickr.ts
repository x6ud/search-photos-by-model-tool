import Axios from 'axios';

type FlickrPhotosSearchResponse = {
    stat: string,
    photos: {
        page: number,
        pages: number,
        perpage: number,
        total: string,
        photo: {
            farm: number,
            id: string,
            isfamily: number,
            isfriend: number,
            ispublic: number,
            owner: string,
            secret: string,
            server: string,
            title: string
        }[],
    }
};

const THUMBNAIL_IMAGE_SUFFIX = '_t.jpg';
const MEDIUM_IMAGE_SUFFIX = '.jpg';
const LARGE_IMAGE_SUFFIX = '_b.jpg';

function getBaseImageUrl(farm: number, server: string, id: string, secret: string) {
    return `https://farm${farm}.static.flickr.com/${server}/${id}_${secret}`;
}

function parseFlickrUrl(url: string) {
    const match = url.match(/farm([0-9]+)\.static\.flickr\.com\/([0-9]+)\/([0-9]+)_([0-9a-z]+)/);
    if (!match) {
        return null;
    }
    return {
        farm: Number(match[1]),
        server: match[2],
        id: match[3],
        secret: match[4]
    };
}

export type FlickrSearchResult = {
    page: number,
    pages: number,
    perPage: number,
    total: number,
    photos: {
        id: string,
        thumb: string,
        medium: string,
        large: string
    }[]
};

export async function flickrSearch(
    apiKey: string,
    keywords: string,
    perPage: number,
    page: number
): Promise<FlickrSearchResult> {
    // https://www.flickr.com/services/api/flickr.photos.search.html
    const params = new URLSearchParams({
        method: 'flickr.photos.search',
        api_key: apiKey,
        format: 'json',
        nojsoncallback: '1',
        license: '2,3,4,5,6,9', // all cc
        privacy_filter: '1', // public photos
        content_type: '1', // photos only
        text: keywords,
        sort: 'relevance',
        per_page: Math.max(1, Math.min(500, perPage)) + '',
        page: page + '',
    });
    const apiUrl = 'https://api.flickr.com/services/rest/?' + params.toString();
    const response = await Axios.create().get(apiUrl);
    const data = response.data as FlickrPhotosSearchResponse;
    if (data.stat !== 'ok') {
        throw new Error('Request failed');
    }
    const photos = data.photos.photo;
    return {
        page: data.photos.page,
        pages: data.photos.pages,
        perPage: data.photos.perpage,
        total: Number(data.photos.total),
        photos: photos.map(photo => {
            const baseUrl = getBaseImageUrl(photo.farm, photo.server, photo.id, photo.secret);
            return {
                id: photo.id,
                thumb: baseUrl + THUMBNAIL_IMAGE_SUFFIX,
                medium: baseUrl + MEDIUM_IMAGE_SUFFIX,
                large: baseUrl + LARGE_IMAGE_SUFFIX
            };
        })
    };
}

export function getFlickrId(url: string) {
    const match = parseFlickrUrl(url);
    return match && match.id;
}

export function getFlickrThumb(url: string) {
    const match = parseFlickrUrl(url);
    if (!match) {
        return url;
    }
    return getBaseImageUrl(match.farm, match.server, match.id, match.secret) + THUMBNAIL_IMAGE_SUFFIX;
}

export function getFlickrAuthorLink(url: string) {
    const match = parseFlickrUrl(url);
    return match ? `https://www.flickr.com/photo.gne?id=${match.id}` : null;
}