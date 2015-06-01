"use strict";

var React = require('react'),
    ImageView = require('./ImageView.react.jsx'),
    PostsAPI = require('../utils/PostsAPI'),
    getScrollbarWidth = require('../utils/getScrollbarWidth'),
    getViewport = require('../utils/getViewport');

var urlPattern = /http:\/\/lorempixel.com\/(\d+)\/(\d+)/;

// some layout styling is set here because the values
// are needed for column count and image scaling
var MAX_PAGE_WIDTH = 1080,
    IMG_WIDTH = 200,
    IMG_MAX_HEIGHT = 600,
    IMG_MIN_HEIGHT = 150,
    POST_PADDING = 5,
    VIEWPORT_PADDING = 5,
    COLUMN_PADDING = 5,
    COLUMN_WIDTH = IMG_WIDTH + 2*COLUMN_PADDING;


module.exports = React.createClass({

  componentDidMount: function() {
    window.addEventListener('resize', this.onResize);
    this.onResize();
    this.getPosts();
  },


  componentWillUnmount: function() {
    window.removeEventListener('resize', this.onResize);
  },


  getInitialState: function() {
    return {
      posts: [],       // post data from API
      pending: false,  // API request pending
      viewport: {},    // viewport dimensions
      active: null     // active post index
    };
  },


  getPosts: function() {
    var self = this;

    // if not pending already ...

    if (!self.state.pending) {

      // set pending true

      self.setState({
        pending: true
      }, function() {

        // then call API

        PostsAPI.getPosts()
          .then(function(posts) {

            // add posts and set pending false

            self.setState({
              posts: self.state.posts.concat(posts),
              pending: false
            });
          })
          .done();
      });
    }
  },


  onResize: function(){
    this.setState({
      viewport: getViewport()
    });
  },


  onClick: function(e) {

    // set active image for ImageView

    this.setState({
      active: e.currentTarget.name
    });
  },


  onHover: function(e) {

    // when mouse is in use, reset tabIndex focus

    document.activeElement.blur();
  },


  onTouch: function(e) {

    // mimic hover for touch screens

    e.currentTarget.focus();
  },


  onScroll: function(e) {
    var scrollHeight = e.target.scrollHeight,
        scrollTop = e.target.scrollTop,
        clientHeight = e.target.clientHeight,
        scrollBottom = scrollTop + clientHeight;

    // get more posts if scrolled to bottom of image feed

    if (!this.state.active &&
        scrollBottom > scrollHeight - IMG_MAX_HEIGHT) {

      this.getPosts();
    }
  },


  closeImageView: function() {
    var wasActive = this.state.active;

    // unset active state

    this.setState({
      active: null
    },

    // refocus for tabIndex

    function() {
      this.refs[wasActive].getDOMNode().focus();
    });
  },


  // RENDER

  render: function() {
    var posts = this.state.posts,
        viewport = this.state.viewport,
        active = this.state.active;

    // initialize columns based on viewport width

    var imageView = null,
        columns = [],
        fullWidth = Math.min(viewport.width, MAX_PAGE_WIDTH),
        scrollbarWidth = getScrollbarWidth(),
        numColumns = parseInt(
          (fullWidth - 2 * VIEWPORT_PADDING -
           scrollbarWidth) / COLUMN_WIDTH
        );

    for (var i=0; i < numColumns; i++) {
      columns.push({
        index: i,
        height: 0,
        images: []
      });
    }


    // if posts not ready, set spinner

    var spinner = null;
    if (!posts.length) {
      spinner = (
        <div className="spinner-container"
             style={{lineHeight: viewport.height + 'px'}}>
          <span className="fa fa-spinner fa-spin"></span>
        </div>
      );
    }


    // if posts are ready ...

    else {
      posts.forEach(function(post, index) { // id, picture (url), text

        // parse image url for dimensions

        var matched = post.picture.match(urlPattern),
            width = parseInt(matched[1]),
            height = parseInt(matched[2]),
            scaledWidth = IMG_WIDTH,
            scaledHeight = height * IMG_WIDTH/width;


        // find current shortest column to add post

        var shortestColumn,
            minHeight = null;

        columns.forEach(function(column) {
          if (minHeight === null || column.height < minHeight) {
            shortestColumn = column.index;
            minHeight = column.height;
          }
        });


        // if no clipping needed, use img as thumbnail

        var img, thumbnail;
        if (scaledHeight >= IMG_MIN_HEIGHT) {

          img = <img src={post.picture + '?nocache=' + post.id}/>;

          thumbnail = img;
        }


        // if clipping needed, wrap image in a clipping div

        else {

          var scaledWidth = width * IMG_MIN_HEIGHT / height;

          var clipStyle = {
            height: IMG_MIN_HEIGHT + 'px',
            overflow: 'hidden',
            position: 'relative',
          };

          var imgStyle = {  // centering
            marginLeft: '-' + (scaledWidth - IMG_WIDTH) / 2 + 'px'
          }

          img = <img src={post.picture + '?nocache=' + post.id}
                     style={imgStyle}/>;

          thumbnail = (
            <div className="img-clip"
                 style={clipStyle}>

              { img }

            </div>
          );

          scaledHeight = IMG_MIN_HEIGHT;
        }


        // build post element

        columns[shortestColumn].images.push(
          <button key={index}
                  ref={index}
                  name={index}
                  tabIndex={active ? -1 : index}
                  className="post"
                  onClick={this.onClick}
                  onMouseMove={this.onHover}
                  onTouchStart={this.onTouch}
                  style={{maxWidth: IMG_WIDTH}}>

            { thumbnail }

            <p className="post-text">
              { post.text }
            </p>

          </button>
        );


        // update column height

        columns[shortestColumn].height += scaledHeight;


        // if img is active, set ImageView

        if (index == active) {

          imageView = (
            <ImageView viewport={viewport}
                       portrait={height > width}
                       close={this.closeImageView}>

              { img }

              <div>
                <p tabIndex="0"
                   className="post-text">
                  { post.text }
                </p>
              </div>

            </ImageView>
          );
        }

      }, this);
    }


    // build columns array

    var contentColumns = columns.map(
      function(column, index) {
        return (
          <div key={index}
               className="content-column"
               style={{
                 width: COLUMN_WIDTH,
                 padding: COLUMN_PADDING}}>

            { column.images }

          </div>
        );
      }
    );

    var viewportStyle = {
      padding: VIEWPORT_PADDING,
    }

    // prevent viewport scroll if ImageView active
    if (active) {
      console.log(scrollbarWidth);
      viewportStyle.overflow = 'hidden';
      viewportStyle.paddingRight = (
        VIEWPORT_PADDING + scrollbarWidth
      );
    }

    return (
      <div className="viewport"
           onScroll={this.onScroll}
           style={viewportStyle}>

        { contentColumns }

        {/* conditional */}
          { imageView }
          { spinner }

      </div>
    );
  }
});
