var Substance = require('substance');
var $$ = React.createElement;
var Surface = Substance.Surface;
var _ = require("substance/helpers");
var TextProperty = require("substance-ui/text_property");
var ContainerEditor = Surface.ContainerEditor;

var Clipboard = Surface.Clipboard;
var SurfaceManager = Surface.SurfaceManager;
var ENABLED_TOOLS = ["strong", "emphasis"];

var components = require('./components');

// Editor
// ----------------
// 
// A very simple rich text editor

var Editor = React.createClass({
  displayName: "Editor",

  // child context signature provided to editor components
  childContextTypes: {
    surface: React.PropTypes.object,
    componentRegistry: React.PropTypes.object
  },

  getChildContext: function() {
    return {
      surface: this.surface,
      componentRegistry: this.componentRegistry
    };
  },

  getInitialState: function() {
    var doc = this.props.doc;
    this.surfaceManager = new SurfaceManager(doc);
    this.clipboard = new Clipboard(this.surfaceManager, doc.getClipboardImporter(), doc.getClipboardExporter());

    var editor = new ContainerEditor('body');
    this.surface = new Surface(this.surfaceManager, doc, editor);

    // Register component registry
    this.componentRegistry = new Substance.Registry();

    _.each(components, function(ComponentClass, name) {
      this.componentRegistry.add(name, ComponentClass);
    }, this);
    console.log(components);

    return {};
  },


  render: function() {
    var doc = this.props.doc;
    var containerNode = doc.get('body');

    // Prepare container components (aka nodes)
    // ---------

    var components = [];

    components = components.concat(containerNode.nodes.map(function(nodeId) {
      var node = doc.get(nodeId);

      var ComponentClass = this.componentRegistry.get(node.type);

      return $$(ComponentClass, {
        key: node.id,
        doc: doc,
        node: node
      });
    }.bind(this)));

    return $$('div', {className: 'editor-component'},
      $$('div', {className: 'body-nodes', ref: 'bodyNodes', contentEditable: true, spellCheck: false},
        components
      )
    );
  },

  componentDidMount: function() {
    this.surfaceManager.registerSurface(this.surface, {
      enabledTools: ENABLED_TOOLS
    });

    this.surface.attach(this.refs.bodyNodes.getDOMNode());
    this.clipboard.attach(React.findDOMNode(this));

    // Needed?
    this.forceUpdate(function() {
      this.surface.rerenderDomSelection();
    }.bind(this));
  },

  componentWillUnmount: function() {
    var doc = this.props.doc;
    // doc.disconnect(this);
    // app.unregisterSurface(surface);
    
    this.surface.dispose();
    this.clipboard.detach(React.findDOMNode(this));
    this.surfaceManager.dispose();
  },

  componentDidUpdate: function() {
    // HACK: when the state is changed this and particularly TextProperties
    // get rerendered (e.g., as the highlights might have changed)
    // Unfortunately we loose the DOM selection then.
    // Thus, we are resetting it here, but(!) delayed as otherwise the surface itself
    // might not have finished setting the selection to the desired and a proper state.
    var self = this;
    setTimeout(function() {
      self.surface.rerenderDomSelection();
    });
  }

});

module.exports = Editor;