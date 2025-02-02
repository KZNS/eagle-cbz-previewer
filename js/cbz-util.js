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
async function getCbzCoverBuffer(src) {
    try {
        let buffer = await fs.promises.readFile(src);
        const zip = await jszip.loadAsync(buffer);

        for (const relativePath of Object.keys(zip.files)) {
            const file = zip.files[relativePath];
            if (!file.dir && isImageFile(relativePath)) {
                // 返回图片的 Buffer 数据
                return file.async('nodebuffer');
            }
        }

        throw new Error('Cannot find the cover image in the CBZ file.');
    } catch (err) {
        throw err;
    }
}

async function cbzCover(src, dist) {
    return new Promise(async (resolve, reject) => {
        try {
            let cover = await getCbzCoverBuffer(src);
            await sharp(cover).toFormat('png').toFile(dist);
            return resolve();
        }
        catch (err) {
            return reject(err);
        }
    });
}


module.exports = {
    cbzCover: cbzCover,
    getCbzCoverBuffer: getCbzCoverBuffer,
};
