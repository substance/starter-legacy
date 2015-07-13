'use strict';

var Substance = require('substance');
var Tool = Substance.Surface.Tool;
var searchReplace = require('../transformations/search_replace');


var SearchReplaceTool = Tool.extend({
  name: "search_replace",

  // init: function() {
  //   this.state.disabled = false;
  // },

  update: function(surface, sel) {
    this.surface = surface;

    // Set disabled when not a property selection
    // if (!surface.isEnabled() || sel.isNull() || !sel.isPropertySelection() || sel.isCollapsed()) {
    //   return this.setDisabled();
    // }

    var newState = {
      surface: surface,
      sel: sel,
      disabled: false
    };

    this.setToolState(newState);
  },

  // Needs app context in order to request a state switch
  // TODO: tools should not depend on this.context.app
  performAction: function() {
    var doc = this.surface.doc;
    console.log('performing the action', doc);

    doc.transaction(function(tx) {
      searchReplace(tx, {
        containerId: 'body',
        searchStr: 'el',
        replaceStr: '$',
      });
    });

    // var app = this.context.app;
    // var sel = app.getSelection();

    // // TODO: implement sel.getText() so we can get this from the document directly;
    // var searchString = window.getSelection().toString();

    // app.replaceState({
    //   contextId: "tagentity",
    //   path: sel.getPath(),
    //   startOffset: sel.getStartOffset(),
    //   endOffset: sel.getEndOffset(),
    //   searchString: searchString
    // });
  }
});

module.exports = SearchReplaceTool;