# React Image Feed

A small React single-page app that displays a feed of random images and text.


## Demo

[Click here](http://adamstone.github.io/react-image-feed/)


## Starting parameters

 - App should display posts (random images and text) obtained from a given URL.
 - Data is passed as JSON in batches of 55 posts per request.
 - Image dimensions are multiples of 100 between 200 and 600 px on each side.
 - Site should be fluid/responsive.


## Strategy

 - Attempting to tile full-size images in 2D is unnecessarily complex. Instead, scale all images down to narrowest width (200px) and display in multiple columns.
 - Clip very wide images to maintain reasonable height.
 - Determine the number of columns dynamically from viewport width.
 - Distribute images evenly between columns by keeping track of column height.
 - Show associated text in dropdown on hover or focus.
 - Click/Enter on a post opens  the full-size image and text in a separate overlay view.
 - Use `<button>` elements and `tabIndex` for keyboard accessibility
 - Load more images when scroll approaches the bottom.


## Issues

On some browsers, clicking a thumbnail opens a full-size view of a different image than the thumbnail displayed. I think this is a side-effect of the non-deterministic lorempixel urls (each request to lorempixel.com/400/300 returns a random 400x300 image) and shouldn't be an issue with real content with distinct urls.