'use strict';

var Substance = require('substance');
var $$ = React.createElement;
var Surface = Substance.Surface;
var _ = require("substance/helpers");
var ContainerEditor = Surface.ContainerEditor;

var Clipboard = Surface.Clipboard;
var SurfaceManager = Surface.SurfaceManager;
var ENABLED_TOOLS = ["strong", "emphasis"];

var ToolComponent = require('substance-ui/tool_component');

var components = require('./components');
var tools = require('./tools');


// Editor
// ----------------
// 
// A simple rich text editor implementation based on Substance


class Editor extends React.Component {

  constructor(props) {
    super(props);

    var doc = props.doc;
    this.surfaceManager = new SurfaceManager(doc);
    this.clipboard = new Clipboard(this.surfaceManager, doc.getClipboardImporter(), doc.getClipboardExporter());

    var editor = new ContainerEditor('body');
    this.surface = new Surface(this.surfaceManager, doc, editor);

    // Component registry
    this.componentRegistry = new Substance.Registry();
    _.each(components, function(ComponentClass, name) {
      this.componentRegistry.add(name, ComponentClass);
    }, this);

    // Tool registry
    this.toolRegistry = new Substance.Registry();
    _.each(tools, function(ToolClass, name) {
      this.toolRegistry.add(name, new ToolClass());
    }, this);
  }

  onDocumentChange(change) {
    var app = this.context.app;
    if (change.isAffected(['body', 'nodes'])) {
      this.forceUpdate();
    }
  }

  onSelectionChanged(sel, surface) {
    this.toolRegistry.each(function(tool) {
      tool.update(surface, sel);
    }, this);
  }

  getChildContext() {
    return {
      surface: this.surface,
      componentRegistry: this.componentRegistry,
      toolRegistry: this.toolRegistry
    };
  }

  render() {
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
      $$('div', {className: 'toolbar'},
        $$(ToolComponent, { tool: 'emphasis', title: 'Emphasis', classNames: ['button', 'tool']}, "Emphasis"),
        $$(ToolComponent, { tool: 'strong', title: 'Strong', classNames: ['button', 'tool']}, "Strong")
      ),
      $$('div', {className: 'body-nodes', ref: 'bodyNodes', contentEditable: true, spellCheck: false},
        components
      )
    );
  }

  componentDidMount() {
    var doc = this.props.doc;

    doc.connect(this, {
      'document:changed': this.onDocumentChange
    });

    this.surfaceManager.registerSurface(this.surface, {
      enabledTools: ENABLED_TOOLS
    });

    this.surface.attach(this.refs.bodyNodes.getDOMNode());


    this.surface.connect(this, {
      'selection:changed': this.onSelectionChanged
    });

    this.clipboard.attach(React.findDOMNode(this));



    // Needed?
    this.forceUpdate(function() {
      this.surface.rerenderDomSelection();
    }.bind(this));
  }

  componentWillUnmount() {
    var doc = this.props.doc;
    doc.disconnect(this);
    // app.unregisterSurface(surface);
    
    this.surface.dispose();
    this.clipboard.detach(React.findDOMNode(this));
    this.surfaceManager.dispose();
  }

  componentDidUpdate() {
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
}


Editor.displayName = "Editor";

  // child context signature provided to editor components
Editor.childContextTypes = {
  surface: React.PropTypes.object,
  componentRegistry: React.PropTypes.object,
  toolRegistry: React.PropTypes.object
};

module.exports = Editor;