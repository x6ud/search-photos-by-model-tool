/**
 * Return picture id if it's a Flickr url, or else return null.
 */
export default function (url) {
    url += '';
    const match = url.match(/https:\/\/farm[0-9]+\.static\.flickr\.com\/[0-9]+\/([0-9]+)_/);
    return match ? match[1] : null;
};