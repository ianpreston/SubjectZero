var fs = require('fs'),
    path = require('path'),

    uuid = require('node-uuid'),

    config = require('./config.js').config;


/**
 * Handles saving uploaded media files to the media upload directory. Takes the
 * current location of the actual uploaded media file (usually in /tmp) and moves
 * it to it's permanent location in config.mediaUploadDir.
 * Returns the file's new location.
 *
 * Synchronous!
 */
exports.savePhysicalMediaFile = function(currentPath) {
    var newPath = path.join(config.mediaUploadPath, uuid.v1());
    fs.renameSync(currentPath, newPath);
    return newPath;
}
