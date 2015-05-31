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
      viewport: {},
      active: null
    };
  },

  componentDidMount: function() {
    window.addEventListener('resize', this.onResize);
    this.onResize();

    var self = this;
    PostsAPI.getPosts().then(function(posts) {
      self.setState({
        posts: posts
      });
    })
    .done();
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
      posts.forEach(function(post) { // id, picture (url), text

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

          img = <img name={post.id}
                     onClick={this.onClick}
                     src={post.picture + '?nocache=' + post.id}/>;

          columns[shortestColumn].images.push(
            <div key={post.id}
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
                     name={post.id}
                     onClick={this.onClick}
                     style={imgStyle}/>;

          columns[shortestColumn].images.push(
            <div className="post"
                 key={post.id}>

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

        if (post.id == active) {

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
           style={{padding: VIEWPORT_PADDING}}>

        { contentColumns }

        {/* conditional */}
          { imageView }
          { spinner }

      </div>
    );
  }
});
