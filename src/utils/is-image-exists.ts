export default function isImageExists(url: string) {
    return new Promise(function (resolve, reject) {
        const image = new Image();
        image.onload = function () {
            resolve(true);
        };
        image.onerror = image.onabort = function () {
            resolve(false);
        };
        image.src = url;
    });
}
