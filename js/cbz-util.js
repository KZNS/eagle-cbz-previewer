const fs = require('fs');
const jszip = require('jszip');
const path = require('path');
const sharp = require('sharp');

const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.webp'];
const COVER_KEYWORD = ['cover', '封面'];

// 判断文件是否是图片
function isImageFile(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    return IMAGE_EXTENSIONS.includes(ext);
}
async function getCbzCoverBuffer(src) {
    try {
        let buffer = await fs.promises.readFile(src);
        const zip = await jszip.loadAsync(buffer);

        let cover = null;
        for (const [relativePath, file] of Object.entries(zip.files).sort()) {
            if (!file.dir && isImageFile(relativePath)) {
                if (!cover) {
                    cover = file;
                }
                const lowerCasePath = relativePath.toLowerCase();
                if (COVER_KEYWORD.some(keyword => lowerCasePath.includes(keyword))) {
                    cover = file;
                    break;
                }
            }
        }

        if (cover)
            return cover.async('nodebuffer');
        else
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
