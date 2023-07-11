const fs = require('fs').promises;
const bodyParser = require('body-parser');

module.exports = function (app) {
    app.use(bodyParser.text());

    app.get('/server/dataList', async function (req, res) {
        try {
            res.json(await fs.readdir('./src/data'));
        } catch (err) {
            res.status(500).send(err);
        }
    });

    app.get('/server/data', async function (req, res) {
        const name = req.query.name;
        try {
            res.send((await fs.readFile('./src/data/' + name)).toString());
        } catch (err) {
            res.status(500).send(err);
        }
    });

    app.post('/server/data', async function (req, res) {
        const name = req.query.name;
        const content = req.body;
        try {
            await fs.writeFile('./src/data/' + name, content);
            const files = await fs.readdir('./src/data');
            const names = files.map(
                filename => filename
                    .substr(0, filename.length - '.json'.length)
                    .replace(/-([a-z])/g, match => match[1].toUpperCase())
            );
            const dataTs =
                names.map((name, index) => `import ${name} from './data/${files[index]}'`)
                    .join('\n')
                + '\n\n'
                + 'export default [\n'
                + names.map(name => `    ...${name},`).join('\n')
                + '\n];'
            await fs.writeFile('./src/data.ts', dataTs);
            res.status(200).send('ok');
        } catch (err) {
            res.status(500).send(err);
        }
    });
};
