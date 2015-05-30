"use strict";

var React = require('react');


module.exports = React.createClass({

  handleKeyDown: function(e) {
    if (e.keyCode === 27) {  // ESC
      this.props.close();
    }
  },

  componentDidMount: function() {
    document.addEventListener("keydown", this.handleKeyDown);
  },


  componentWillUnmount: function() {
    document.removeEventListener("keydown", this.handleKeyDown);
  },


  onClick: function(e) {
    if (e.target == e.currentTarget) {
      this.props.close();
    };
  },


  render: function() {

    var viewport = this.props.viewport,
        orientation = this.props.orientation,
        close = this.props.close;

    return (
      <div className="image-view"
           onClick={this.onClick}
           style={{ lineHeight: viewport.height + 'px' }}>

        <div className="content-box">

          <span className="fa fa-close close-button"
                onClick={close}></span>

          { this.props.children }

        </div>

      </div>
    );
  }
});
