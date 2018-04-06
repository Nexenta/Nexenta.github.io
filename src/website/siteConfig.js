const siteConfig = {
  title: 'Nexenta',
  tagline: 'Your universal Scale-Out Storage Software with global Deduplication and Compression',
  url: 'https://nexenta.github.io',
  baseUrl: '/',
  projectName: 'nexenta.github.io', // or set an env variable PROJECT_NAME
  organizationName: 'nexentaedge', // or set an env variable ORGANIZATION_NAME
  headerLinks: [
    {href: 'https://groups.google.com/forum/#!forum/nexentaedge-users', label: 'Ask us'},
    {doc: 'introduction', label: 'Documentation'},
    {blog: true, label: 'Blog'}
  ],
  users: [
    //{
    //  caption: "Ericson",
    //  image: "/test-site/img/docusaurus.svg",
    //  infoLink: "https://www.facebook.com",
    //  pinned: true
    //}
  ],
  headerIcon: 'img/logo-nexenta.png',
  footerIcon: 'img/logo-nexenta.png',
  favicon: 'img/favicon.png',
  colors: {
    primaryColor: '#e86b00',
    secondaryColor: '#c6c6c6'
  },
  //fonts: {
  //  myFont: [
  //    "Open Sans",
  //    "-apple-system",
  //    "system-ui"
  //  ]
  //  myOtherFont: [
  //    "-apple-system",
  //    "system-ui"
  //  ]
  //},
  copyright: `Copyright © ${new Date().getFullYear()} Nexenta Systems`,
  highlight: {
    // Highlight.js theme to use for syntax highlighting in code blocks
    theme: 'default'
  },
  scripts: [
    'https://buttons.github.io/buttons.js',
    'https://use.fontawesome.com/releases/v5.0.8/js/all.js',
    'https://unpkg.com/mermaid@8.0.0-rc.6/dist/mermaid.min.js',
    '/js/main.js'
  ],
  // You may provide arbitrary config keys to be used as needed by your template.
  repoUrl: 'https://github.com/Nexenta/nedge-dev',
  //stylesheets: ['/css/fonts.css'],
  algolia: {
    apiKey: '839b05a95d1375c54722a0161e78d578',
    indexName: 'nexentaedge'
  },
  editUrl: 'https://github.com/Nexenta/Nexenta.github.io/edit/master/src/docs/'
};

module.exports = siteConfig;
