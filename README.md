# x6ud.github.io

## Project setup
```
npm install
```

## Compiles and hot-reloads for development
```
npm run serve
```

## Compiles and minifies for production
```
npm run build
```

## Adding photos
1. I use Flickr API to easily get a list of image urls.
   See [flickr.photos.search](https://www.flickr.com/services/api/explore/flickr.photos.search) and
   [Photo Source URLs](https://www.flickr.com/services/api/misc.urls.html).
   
   Note: Set license param as `2,3,4,5,6,9` to search images with CC License only.
   
2. Paste the image urls array into `src/photos.js`.

3. Open `/#/editor`, click the "Get One" button to get an url from photos.js each time. Clicking the Save button will save the data in browser local storage.

4. Click export button to copy data JSON to clipboard. Then paste the JSON into `src/data`.

   Alternately, you can apply for a Flickr API key [here](https://www.flickr.com/services/apps/create/apply/), and either paste it into the textbox requesting it on the editor page or add the following to a .env.local file on project root:
   ```
   VUE_APP_FLICKR_API=<your flicker key here>
   ```
   This will allow inline search and fetching.  

## Adding models
1. Put the .obj file into `public/assets/models`. It's better to keep files within 1MB. I use Blender and MeshLab to reduce the models.

2. Add model url and author link to `src/models.js`.