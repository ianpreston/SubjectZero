var mongoose = require('mongoose'),
    path = require('path');

var TemplateSchema = new mongoose.Schema({
    template_name: { type: String, validate: [function(n) { return n.length > 0 }, 'Template must have a name'] },
    body: String
});

var PageSchema = new mongoose.Schema({
    // The path to the page within webroot. i.e. if webroot is '/webroot/' and
    // a page's .path is '/index.html', the page will be compiled and saved to
    // '/webroot/index.html'
    path: { type: String,
            validate: [function(p) { return p != '/'; }, 'Page must have a path'],
            set: function(p) { return path.normalize('/' + p); } },

    // The Template that this page belongs to
    template: { type: mongoose.Schema.ObjectId, ref: 'Template' },

    // The page's title. Generally used in <title> and headers within the page
    title: String,

    // The contents of the page
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
