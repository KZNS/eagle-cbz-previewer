const fs = require('fs');
const jszip = require('jszip');

async function cbzCover(src, dist) {
    return new Promise(async (resolve, reject) => {
        try {
            let buffer = await fs.promises.readFile(src);
            const zip = await jszip.loadAsync(buffer);
            const cover = zip.files['test/cover.png'];
            if (cover) {
                let data = await cover.async('nodebuffer');
                await fs.promises.writeFile(dist, data);
                return resolve();
            }
            return reject(new Error(`Can not find the cover image in the cbz file.`));
        }
        catch (err) {
            return reject(err);
        }
    });
}


module.exports = {
    cbzCover: cbzCover,
};
