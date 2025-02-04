const yauzl = require('yauzl');
const path = require('path');
const sharp = require('sharp');

const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.webp'];
const COVER_KEYWORD = ['cover', '封面'];

// 判断文件是否是图片
function isImageFile(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    return IMAGE_EXTENSIONS.includes(ext);
}
function isCoverFile(filePath) {
    const lowerCasePath = filePath.toLowerCase();
    return COVER_KEYWORD.some(keyword => lowerCasePath.includes(keyword));
}

async function getCbzCoverBuffer(src) {
    return new Promise(async (resolve, reject) => {
        try {
            yauzl.open(src, { lazyEntries: true }, function (err, zipfile) {
                if (err) throw err;
                let imageEntry = null;
                let isCover = false;
                let fileBuffer = [];
                zipfile.readEntry();
                zipfile.on("entry", function (entry) {
                    if (!entry.fileName.endsWith('/') && isImageFile(entry.fileName)) {
                        let read = false;
                        if (!imageEntry) {
                            read = true;
                        } else {
                            if ((isCover && isCoverFile(entry.fileName) && entry.fileName < imageEntry.fileName) ||
                                (!isCover && (isCoverFile(entry.fileName) || entry.fileName < imageEntry.fileName))) {
                                read = true;
                            }
                        }
                        // 打开该条目并读取数据
                        if (read) {
                            imageEntry = entry;
                            isCover = isCoverFile(entry.fileName);
                            zipfile.openReadStream(entry, (err, readStream) => {
                                if (err) throw err;
                                fileBuffer = [];
                                readStream.on("data", (chunk) => {
                                    fileBuffer.push(chunk);
                                });
                                readStream.on("end", () => {
                                    zipfile.readEntry();
                                });
                            });
                        }
                        else {
                            zipfile.readEntry();
                        }
                    } else {
                        zipfile.readEntry();
                    }
                });
                zipfile.on("end", function () {
                    resolve(Buffer.concat(fileBuffer));
                });
            });
        } catch (err) {
            reject(err);
        }
    });
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
