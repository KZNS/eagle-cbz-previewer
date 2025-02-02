const fs = require('fs');
const jszip = require('jszip');
const path = require('path');
const sharp = require('sharp');

const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.webp'];

// 判断文件是否是图片
function isImageFile(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    return IMAGE_EXTENSIONS.includes(ext);
}

async function cbzCover(src, dist) {
    return new Promise(async (resolve, reject) => {
        try {
            let buffer = await fs.promises.readFile(src);
            const zip = await jszip.loadAsync(buffer);
            let cover = null;
            for (const relativePath of Object.keys(zip.files)) {
                const file = zip.files[relativePath];
                if (!file.dir && isImageFile(relativePath)) {
                    cover = file;
                    break;
                }
            }
            if (cover) {
                const data = await cover.async('nodebuffer');
                //await sharp(data).toFormat('png').toFile(dist);
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
