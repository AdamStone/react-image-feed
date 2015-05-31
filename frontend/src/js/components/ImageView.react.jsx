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

    // focus invisible span to enable arrow key scrolling
    this.refs.scrollFocus.getDOMNode().focus();
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

          <span tabIndex="0"
                ref="scrollFocus"
                style={{border: '0',
                        opacity: '0',
                        outline: '0'}}></span>

          <button title="close"
                  onClick={close}
                  className="close-button">

            <span className="fa fa-close"></span>

          </button>

          { this.props.children }

        </div>

      </div>
    );
  }
});
