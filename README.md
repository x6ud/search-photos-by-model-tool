# x6ud.github.io

## Project setup
```
npm install
```

## Development
```
npm run serve
```

## Compiles and minifies for production
```
npm run build
```

## Adding photos
1. Apply for a Flickr API key [here](https://www.flickr.com/services/apps/create/apply/).

2. Run the project with `npm run serve`.

3. Open `/#/editor`, paste your Flickr API key into the textbox requesting it.

4. Click the "Get One" button to get a photo.

## Adding models
1. Put the .obj file into `public/assets/models`. It's better to keep files within 1MB. I use Blender and MeshLab to reduce the models.

2. Add model url and author link to `src/models.ts`.
