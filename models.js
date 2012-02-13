var mongoose = require('mongoose'),
    path = require('path');

var TemplateSchema = new mongoose.Schema({
    template_name: { type: String, validate: [function(n) { return n.length > 0 }, 'Template must have a name'] },
    body: String
});

var PageSchema = new mongoose.Schema({
    path: { type: String,
            validate: [function(p) { return p != '/'; }, 'Page must have a path'],
            set: function(p) { return path.normalize('/' + p); } },
    template: { type: mongoose.Schema.ObjectId, ref: 'Template' },
    title: String,
    body: String
});

var StaticFileSchema = new mongoose.Schema({
    path: { type: String,
            validate: [function(p) { return p != '/'; }, 'Static file must have a path'],
            set: function(p) { return path.normalize('/' + p); } },

    // True if the file is a text-only static file that should be
    // editable from the web interface, False if it is an image or
    // other media file that can be uploaded via the web interface
    isText: Boolean,

    // If isText, the body of the static file, otherwise null
    body: String,

    // If !isText, the location where the uploaded file is stored
    // on the filesystem
    mediaFilePath: String
});

exports.Template = mongoose.model('Template', TemplateSchema);
exports.Page = mongoose.model('Page', PageSchema);
exports.StaticFile = mongoose.model('StaticFile', StaticFileSchema);
