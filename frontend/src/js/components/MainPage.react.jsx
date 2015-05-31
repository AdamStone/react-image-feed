"use strict";

var React = require('react'),
    ImageView = require('./ImageView.react.jsx'),
    PostsAPI = require('../utils/PostsAPI'),
    getViewport = require('../utils/getViewport');

var urlPattern = /http:\/\/lorempixel.com\/(\d+)\/(\d+)/;

// some layout styling is set here because the values
// are needed for column count and image scaling
var MAX_PAGE_WIDTH = 1080,
    IMG_WIDTH = 200,
    IMG_MAX_HEIGHT = 600,
    SCROLLBAR_ADJUST = 20,  // should be >= max scrollbar width
    IMG_MIN_HEIGHT = 150,
    POST_PADDING = 5,
    VIEWPORT_PADDING = 5,
    COLUMN_PADDING = 5,
    COLUMN_WIDTH = IMG_WIDTH + 2*COLUMN_PADDING;


module.exports = React.createClass({

  getInitialState: function() {
    return {
      posts: [],
      pending: false,
      viewport: {},
      active: null
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

  componentDidMount: function() {
    window.addEventListener('resize', this.onResize);
    this.onResize();
    this.getPosts();
  },

  componentWillUnmount: function() {
    window.removeEventListener('resize', this.onResize);
  },

  onResize: function(){
    this.setState({
      viewport: getViewport()
    });
  },

  onClick: function(e) {
    this.setState({
      active: e.currentTarget.name
    });
  },

  onScroll: function(e) {

    var scrollHeight = e.target.scrollHeight,
        scrollTop = e.target.scrollTop,
        clientHeight = e.target.clientHeight,
        scrollBottom = scrollTop + clientHeight;

    // get more posts if scrolled to bottom of image feed

    if (scrollBottom > scrollHeight - IMG_MAX_HEIGHT && !this.state.active) {
      this.getPosts();
    }
  },

  closeImageView: function() {
    this.setState({
      active: null
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
        numColumns = parseInt(
          (fullWidth - 2 * VIEWPORT_PADDING -
           SCROLLBAR_ADJUST) / COLUMN_WIDTH
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


        // if no clipping needed, add normal post

        var img;
        if (scaledHeight >= IMG_MIN_HEIGHT) {

          img = <img name={index}
                     onClick={this.onClick}
                     src={post.picture + '?nocache=' + post.id}/>;

          columns[shortestColumn].images.push(
            <div key={index}
                 className="post">

              { img }

              <p className="post-text">
                { post.text }
              </p>

            </div>
          );
        }


        // if clipping needed, wrap image in a clipping div

        else {

          var scaledWidth = width * IMG_MIN_HEIGHT / height;

          var clipStyle = {
            height: IMG_MIN_HEIGHT + 'px',
            overflow: 'hidden',
            position: 'relative',
          };

          var imgStyle = {
            marginLeft: '-' + (scaledWidth - IMG_WIDTH) / 2 + 'px'
          }

          img = <img src={post.picture + '?nocache=' + post.id}
                     name={index}
                     onClick={this.onClick}
                     style={imgStyle}/>;

          columns[shortestColumn].images.push(
            <div className="post"
                 key={index}>

              <div className="img-clip"
                   style={clipStyle}>

                { img }

              </div>
              <p className="post-text">
                { post.text }
              </p>
              </div>
          );
          scaledHeight = IMG_MIN_HEIGHT;
        }


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
                <p className="post-text">
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


    return (
      <div className="viewport"
           onScroll={this.onScroll}
           style={{padding: VIEWPORT_PADDING}}>

        { contentColumns }

        {/* conditional */}
          { imageView }
          { spinner }

      </div>
    );
  }
});
