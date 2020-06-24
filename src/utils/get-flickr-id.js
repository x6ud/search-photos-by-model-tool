/**
 * Return picture id if it's a Flickr url, otherwise return null.
 */
export default function (url) {
    url += '';
    const match = url.match(/flickr\.com\/[0-9]+\/([0-9]+)_/);
    return match ? match[1] : null;
};
