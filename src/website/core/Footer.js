/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');

class Footer extends React.Component {
  docUrl(doc, language) {
    const baseUrl = this.props.config.baseUrl;
    return baseUrl + 'docs/' + (language ? language + '/' : '') + doc;
  }

  pageUrl(doc, language) {
    const baseUrl = this.props.config.baseUrl;
    return baseUrl + (language ? language + '/' : '') + doc;
  }

  render() {
    const currentYear = new Date().getFullYear();
    return (
      <footer className="nav-footer" id="footer">
        <section className="sitemap">
          <a href={this.props.config.baseUrl} className="nav-home">
            {this.props.config.footerIcon && (
              <img
                src={this.props.config.baseUrl + this.props.config.footerIcon}
                alt={this.props.config.title}
                width="66"
                height="58"
              />
            )}
          </a>
          <div>
            <h5>Docs</h5>
            <a href={this.docUrl('introduction.html', this.props.language)}>Getting Started</a>
            <a href="https://nexenta.com/products/nexentaedge">Enterprise Documentation</a>
            <a href="https://edgex.docs.apiary.io/">Edge-X S3 API Reference</a>
          </div>
          <div>
            <h5>Community</h5>
            <a href="https://twitter.com/nexenta" target="_blank">
              <i className="fab fa-twitter fa-sm fa-fw"></i> Twitter
            </a>
            <a href="https://join.slack.com/t/nexentaedge/shared_invite/enQtMzEwMjA5MTczNDU3LTVmNjk4NjEwNTVlYThjMjg4NWI0ZWM5NTBjNTE5YzgwZTFjYjhjMWFhMWY4NjYxYWI0YWJmOTFkNTY5MmI1YWI" target="_blank">
              <i className="fab fa-slack fa-sm fa-fw"></i> Slack
            </a>
            <a href="https://groups.google.com/forum/#!forum/nexentaedge-users" target="_blank">
              <i className="fab fa-google fa-sm fa-fw"></i> Google Group
            </a>
          </div>
          <div>
            <h5>More</h5>
            <a href={this.props.config.baseUrl + 'blog'}><i className="fas fa-book fa-sm fa-fw"></i> Blog</a>
            <a href={this.props.config.repoUrl}><i className="fab fa-github fa-sm fa-fw"></i> GitHub</a>
            <a
              className="github-button"
              href={this.props.config.repoUrl}
              data-icon="octicon-star"
              data-count-href="/facebook/docusaurus/stargazers"
              data-show-count={true}
              data-count-aria-label="# stargazers on GitHub"
              aria-label="Star this project on GitHub"
            >
              Star
            </a>
          </div>
        </section>

        <section className="copyright">Copyright &copy; {currentYear} Nexenta Systems, Inc.</section>
      </footer>
    );
  }
}

module.exports = Footer;
