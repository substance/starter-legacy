"use strict";

var Substance = require('substance');

var Paragraph = Substance.Document.Paragraph;
var Emphasis = Substance.Document.Emphasis;
var Strong = Substance.Document.Strong;

var Substance = require('substance');
var Document = Substance.Document;

var schema = new Document.Schema("rich-text-article", "1.0.0");

schema.getDefaultTextType = function() {
  return "paragraph";
};

schema.addNodes([
  Paragraph,
  Emphasis,
  Strong,
]);

var RichTextArticle = function() {
  RichTextArticle.super.call(this, schema);
};

RichTextArticle.Prototype = function() {

  this.initialize = function() {
    this.super.initialize.apply(this, arguments);

    this.create({
      type: "container",
      id: "body",
      nodes: []
    });
  };

  // this.documentDidLoad = function() {
  //   Interview.super.prototype.documentDidLoad.call(this);
  // };
};

Substance.inherit(RichTextArticle, Document);

RichTextArticle.schema = schema;

RichTextArticle.fromJson = function(json) {
  var doc = new RichTextArticle();
  doc.loadSeed(json);
  doc.documentDidLoad();
  return doc;
};


module.exports = RichTextArticle;