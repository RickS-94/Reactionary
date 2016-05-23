'use strict';

var App = React.createClass({
  displayName: 'App',

  getInitialState: function getInitialState() {
    return {
      titles: ['Site Name', 'Primary', 'Secondary'],
      primary: [{ title: '', excerpt: '', content: '', id: 0 }, { title: '', excerpt: '', content: '', id: 1 }],
      secondary: [{ title: '', excerpt: '', content: '', id: 2 }, { title: '', excerpt: '', content: '', id: 3 }],
      active: [0],
      contentScope: 'primary'
    };
  },

  rawHTML: function rawHTML(text) {
    return { __html: text.rendered };
  },

  updateMainView: function updateMainView(i, scopetype) {
    this.setState({ active: i });
    this.setState({ contentScope: scopetype });
    document.getElementById('main').classList.remove('collapsed');
    document.getElementById('main').classList.add('expanded');
    document.getElementById('primary').classList.remove('expanded');
    document.getElementById('primary').classList.add('collapsed');
    document.getElementById('secondary').classList.remove('expanded');
    document.getElementById('secondary').classList.add('collapsed');
  },

  componentDidMount: function componentDidMount() {
    var connection = new XMLHttpRequest();
    connection.open('GET', 'wp-content/themes/reactionary/assets/content/posts.json', true);
    connection.send();
    connection.onreadystatechange = (function () {
      if (connection.readyState == 4 && connection.status == 200) {
        var result = JSON.parse(connection.responseText);
        if (this.isMounted()) {
          this.setState({
            menu: result.menu.posts,
            primary: result.primary.posts,
            secondary: result.secondary.posts,
            titles: [result.menu.title, result.primary.title, result.secondary.title]
          });
        }
      }
    }).bind(this);
  },

  render: function render() {
    var active = this.state.active;
    var contentScope = this.state.contentScope;
    var blogname = this.state.titles[0];
    var primaryLocation = this.state.titles[1];
    var secondaryLocation = this.state.titles[2];

    return React.createElement(
      'div',
      { id: 'content' },
      React.createElement(MastHead, { blogname: blogname }),
      React.createElement(SidebarElement, { location: 'primary', labelTitle: primaryLocation, initialItemNumber: 3, parent: this }),
      React.createElement(SidebarElement, { location: 'secondary', labelTitle: secondaryLocation, initialItemNumber: 4, parent: this }),
      React.createElement(MainView, { article: this.state[contentScope][active] })
    );
  }
});

var MainView = React.createClass({
  displayName: 'MainView',

  rawHTML: function rawHTML(text) {
    return { __html: text.rendered };
  },

  render: function render() {
    if (this.props.article.image_urls) {
      var $screensize = parseInt(screen.width / 640);
      var imageurl = $screensize < 2 ? this.props.article.image_urls.smallWide : $screensize < 3 ? this.props.article.image_urls.mediumWide : this.props.article.image_urls.largeWide;
    }

    return React.createElement(
      'main',
      { id: 'main', className: 'expanded' },
      this.props.article.image_urls ? React.createElement('img', { className: 'mainImage', src: imageurl }) : '',
      React.createElement('h1', { className: 'mainTitle', dangerouslySetInnerHTML: this.rawHTML(this.props.article.title) }),
      React.createElement('div', { className: 'mainContent', dangerouslySetInnerHTML: this.rawHTML(this.props.article.content) })
    );
  },

  componentDidUpdate: function componentDidUpdate() {
    var main = document.getElementById('main');
    var tags = ['pre', 'code'];
    reactionaryCopybutton(main, tags);
  }

});

var MastHead = React.createClass({
  displayName: 'MastHead',

  rawHTML: function rawHTML(text) {
    return { __html: text.rendered };
  },
  render: function render() {
    return React.createElement(
      'div',
      { id: 'masthead' },
      React.createElement(
        'h1',
        null,
        this.props.blogname
      )
    );
  }
});

var SidebarElement = React.createClass({
  displayName: 'SidebarElement',

  getInitialState: function getInitialState() {
    return {
      displayItems: this.props.initialItemNumber, // How many sidebar items should the first page loop through
      status: 'collapsed' };
  },

  rawHTML: function rawHTML(text) {
    return { __html: text.rendered };
  },

  updateMainView: function updateMainView(i, loc) {
    window.scrollTo(0, 0);
    this.props.parent.updateMainView(i, loc);
    this.setState({ status: 'collapsed' });
    this.setState({ displayItems: this.props.initialItemNumber });
  },

  expandSideBar: function expandSideBar(event) {
    var main = document.getElementById('main');
    var oldMainDisplayClass = '';
    var newMainDisplayClass = '';

    if (this.state.status === 'collapsed') {
      // initial state / Collapsed -> Expanded
      this.setState({ status: 'expanded' });
      this.setState({ clickMessage: 'Show Less' });
      this.setState({ displayItems: this.props.parent.state[this.props.location].length }); // show all the items
      oldMainDisplayClass = 'expanded';
      newMainDisplayClass = 'collapsed';
    } else {
      // When closing down / expanded -> collapsed
      this.setState({ status: 'collapsed' });
      this.setState({ clickMessage: 'Show More' });
      this.setState({ displayItems: this.props.initialItemNumber }); // show all the items
      oldMainDisplayClass = 'collapsed';
      newMainDisplayClass = 'expanded';
    };

    main.classList.remove(oldMainDisplayClass);
    main.classList.add(newMainDisplayClass);
  },

  render: function render() {
    var loc = this.props.location;
    var displayedItems = this.props.parent.state[loc].slice(0, this.state.displayItems);
    return React.createElement(
      'ul',
      { id: loc, className: this.state.status },
      React.createElement(
        'h3',
        { className: 'title' },
        this.props.labelTitle
      ),
      displayedItems.map(function (singleCase, i) {
        return React.createElement(
          'li',
          { onClick: this.updateMainView.bind(null, i, loc), key: i },
          singleCase.image_urls ? React.createElement('img', { src: singleCase.image_urls.smallWide, imageSize: 'smallWide' }) : '',
          React.createElement(
            'span',
            { className: 'slinky' },
            React.createElement('h4', { dangerouslySetInnerHTML: this.rawHTML(singleCase.title) }),
            React.createElement('div', { className: 'excerpt', dangerouslySetInnerHTML: this.rawHTML(singleCase.excerpt) })
          )
        );
      }, this),
      React.createElement(
        'li',
        { onClick: this.expandSideBar },
        React.createElement('h3', { className: 'expandButton' })
      )
    );
  }
});

React.render(React.createElement(App, null), document.getElementById('body'));

/************ COPYBUTTON ************/
function reactionaryCopybutton() {
  var container = arguments.length <= 0 || arguments[0] === undefined ? document.getElementsByTagName('body')[0] : arguments[0];
  var tags = arguments.length <= 1 || arguments[1] === undefined ? ['blockquote', 'pre', 'code'] : arguments[1];

  if (document.execCommand) {

    // purge hiddenCopyContainers - there can be only one
    var existingHiddenContainer = document.getElementById('hiddenCopyContainer');
    if (existingHiddenContainer) existingHiddenContainer.remove();

    var hiddenCopyContainer = document.createElement('TEXTAREA');
    hiddenCopyContainer.style.position = 'absolute';
    hiddenCopyContainer.style.left = '-200vw';
    hiddenCopyContainer.id = 'hiddenCopyContainer';
    window.body.appendChild(hiddenCopyContainer);

    var blocks = container.querySelectorAll(tags.join());
    if (blocks.length > 0) {
      for (var i = 0; i < blocks.length; i++) {
        var copyButton = document.createElement('BUTTON');
        copyButton.className = 'reactionary-copy-button';
        copyButton.innerHTML = '<h5>Copy</h5>';
        copyButton.addEventListener('click', reactionaryCopyClickListener.bind(null, blocks[i].innerText));
        blocks[i].appendChild(copyButton);
      }
    }
  }
}

function reactionaryCopyClickListener(textToCopy) {
  var hiddenCopyContainer = document.getElementById('hiddenCopyContainer');
  hiddenCopyContainer.value = textToCopy;
  hiddenCopyContainer.select();
  document.execCommand('copy');
}

/************* Tweetbutton ***********/
function reactionaryTweetbutton() {
  var quotes = document.getElementsByTagName('blockquote');
  if (quotes.length > 0) {
    for (var i = 0; i < quotes.length; i++) {
      var link = window.location.href;
      var tweetButton = document.createElement('A');
      tweetButton.className = 'reactionary-tweet-link';
      tweetButton.innerHTML = '<h5>Tweet This</h5>';
      tweetButton.target = '_blank';
      tweetButton.href = 'http://twitter.com/home/?status=' + quotes[i].innerText.substring(0, 159 - link.length) + ' ' + link;
      tweetButton.addEventListener('click', reactionaryCopyClickListener.bind(null, quotes[i].innerText));
      quotes[i].appendChild(tweetButton);
    }
  }
}

/************ Media size quantifier ***************/
// Quantifies the size of display/screen from 1 (small) to 5 (really big)

function reactionaryScreenSize() {
  var size = parseInt(screen.width / 640);
  console.log(size);
}
// Toggle class - it is either either "collapsed" or "expanded"
