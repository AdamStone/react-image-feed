"use strict";

var React = require('react');
var MainPage = require('./components/MainPage.react.jsx');

React.initializeTouchEvents(true);

React.render(
  <MainPage/>,
  document.body
);
