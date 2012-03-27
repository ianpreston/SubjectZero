var fs = require('fs'),
    path = require('path'),

    uuid = require('node-uuid'),

    config = require('./config.js').config;


/**
 * Returns a filename that the content of a static media file should be stored
 * in. This doesn't modify the filesystem at all.
 */
exports.createPhysicalMediaFilename = function() {
    return path.join(config.mediaUploadPath, uuid.v1());
}

/**
 * Takes input in the form of a file extension (i.e. 'js', 'html', 'css', etc)
 * and returns an AceJS editor Mode (i.e., 'javascript, 'html', 'css', et al). Returns
 * 'text' if no editor mode is found for the extension.
 */
exports.getAceModeFromExtension = function(ext) {
    return extensionsToAceModes[ext] || 'text';
}

var extensionsToAceModes = {
    'js': 'javascript',
    'html': 'html',
    'css': 'css',
    'php': 'php'
};