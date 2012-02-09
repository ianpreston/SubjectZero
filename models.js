var mongoose = require('mongoose'),
    path = require('path');

var TemplateSchema = new mongoose.Schema({
    template_name: { type: String, validate: [function(n) { return n.length > 0 }, 'Template must have a name'] },
    body: String
});

var PageSchema = new mongoose.Schema({
    path: String, /* TODO normalize path before insertion */
    template: { type: mongoose.Schema.ObjectId, ref: 'Template' },
    title: String,
    body: String
});

exports.Template = mongoose.model('Template', TemplateSchema);
exports.Page = mongoose.model('Page', PageSchema);
