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

exports.Template = mongoose.model('Template', TemplateSchema);
exports.Page = mongoose.model('Page', PageSchema);
