const React = require('react');

const CompLibrary = require('../../core/CompLibrary.js');
const MarkdownBlock = CompLibrary.MarkdownBlock; /* Used to read markdown */
const Container = CompLibrary.Container;
const GridBlock = CompLibrary.GridBlock;

const siteConfig = require(process.cwd() + '/siteConfig.js');

function imgUrl(img) {
  return siteConfig.baseUrl + 'img/' + img;
}

function pageUrl(page, language) {
  return siteConfig.baseUrl + (language ? language + '/' : '') + page;
}

class Button extends React.Component {
  render() {
    return (
      <div className="pluginWrapper buttonWrapper">
        <a className="button" href={this.props.href} target={this.props.target}>
          {this.props.children}
        </a>
      </div>
    );
  }
}

Button.defaultProps = {
  target: '_self'
};

const SplashContainer = (props) => (
  <div
    className="homeContainer"
    style={{
      background: `url(${imgUrl('background.jpg')})`,
      backgroundRepeat: 'no-repeat',
      backgroundSize: '100% 100%'
    }}
  >
    <div className="homeSplashFade">
      <div className="wrapper homeWrapper">{props.children}</div>
    </div>
  </div>
);

const ProjectTitle = () => (
  <h2 className="projectTitle">
    Discover NexentaEdge
    <small>
      <i>{siteConfig.tagline}</i>
    </small>
  </h2>
);

const PromoSection = (props) => (
  <div className="section promoSection">
    <div className="promoRow">
      <div className="pluginRowBlock">{props.children}</div>
    </div>
  </div>
);

class HomeSplash extends React.Component {
  render() {
    return (
      <SplashContainer>
        <div className="inner">
          <ProjectTitle />
          <PromoSection>
            <Button href="https://github.com/Nexenta/edge-dev" target="_blank">
              <i className="fab fa-github fa-lg fa-fw" /> Github
            </Button>
            <Button href="https://twitter.com/nexenta" target="_blank">
              <i className="fab fa-twitter fa-lg fa-fw" /> Twitter
            </Button>
            <Button
              href="https://join.slack.com/t/nexentaedge/shared_invite/enQtMzEwMjA5MTczNDU3LTVmNjk4NjEwNTVlYThjMjg4NWI0ZWM5NTBjNTE5YzgwZTFjYjhjMWFhMWY4NjYxYWI0YWJmOTFkNTY5MmI1YWI"
              target="_blank"
            >
              <i className="fab fa-slack fa-lg fa-fw" /> Slack
            </Button>
            <Button href="https://groups.google.com/forum/#!forum/nexentaedge-users" target="_blank">
              <i className="fab fa-google fa-lg fa-fw" /> Google Group
            </Button>
            <Button href={pageUrl('tryOnline.html')}>
              <i className="fas fa-globe fa-lg fa-fw" /> Try Online
            </Button>
          </PromoSection>
        </div>
      </SplashContainer>
    );
  }
}

const Block = (props) => (
  <Container padding={['bottom', 'top']} id={props.id} background={props.background}>
    <GridBlock align="center" contents={props.children} layout={props.layout} />
  </Container>
);

const Features = () => (
  <Block layout="fourColumn">
    {[
      {
        content: `<ul align="left">
<li>Advanced Versioned S3 Object Append and RW ”Object as File” access
<li>S3 Object as a Key-Value database, including integrations with Caffe, TensorFlow, Spark, Kafka, etc
<li>High-performance Versioned S3 Object Stream Session ”RW”, including FUSE library to mount an object
<li>Management API for Snapshots and Clones, including Bucket instantaneous snapshots
<li>Transparent NFS to/from S3 bucket access, “ingest via NFS, read via S3” or vice-versa
</ul>
<a class="button" href="https://github.com/Nexenta/edge-dev" target="_blank">Learn More</a>
`,
        image: imgUrl('machine_learning_logo.png'),
        imageAlign: 'top',
        title: 'Optimized for AI/ML frameworks'
      },
      {
        content: `<ul align="left">
<li>Deployed as containers and managed using standard container tools
<li>Micro-services for data access to File ”NFS”, Block ”iSCSI/NBD”, Object ”S3/SWIFT” and NOSQL database
<li>Global inline deduplication and compression
<li>Global Name space and built-in Multi-Tenancy
<li>Enterprise class feature set with built-in data reduction, snapshots, clones and QoS
<li>Easy administration with DevOps familiar tools, e.g. (upcoming Rook.IO integration)
</ul>
<a class="button" href="https://github.com/Nexenta/edge-dev" target="_blank">Learn More</a>
`,
        image: imgUrl('microservices_logo.png'),
        imageAlign: 'top',
        title: 'Multi-Protocol Persistent Volumes'
      },
      {
        content: `<ul align="left">
<li>S3 Object as a Key-Value storage database with easy access via Node.JS, Java, Python, C/C++ APIs
<li>Advanced S3 Object Append and RW access, High-performance versioning
<li>High-performance S3 Object Stream Session ”POSIX mountable”
<li>Management API for Snapshots and Clones where any types of objects and buckets can be snapshotted and cloned
<li>Dynamic data placement and automatic load balancing
</ul>
<a class="button" href="https://github.com/Nexenta/edge-dev" target="_blank">Learn More</a>
`,
        image: imgUrl('big_data_logo.png'),
        imageAlign: 'top',
        title: 'Edge-X S3 API for Big Data and Analytics'
      }
    ]}
  </Block>
);

const Showcase = (props) => {
  if ((siteConfig.users || []).length === 0) {
    return null;
  }
  const showcase = siteConfig.users
    .filter((user) => {
      return user.pinned;
    })
    .map((user, i) => {
      return (
        <a href={user.infoLink} key={i}>
          <img src={user.image} title={user.caption} />
        </a>
      );
    });

  return (
    <div className="productShowcaseSection paddingBottom">
      <h2>{"Who's Using This?"}</h2>
      <p>This project is used by all these people</p>
      <div className="logos">{showcase}</div>
      <div className="more-users">
        <a className="button" href={pageUrl('users.html', props.language)}>
          More {siteConfig.title} Users
        </a>
      </div>
    </div>
  );
};

class Index extends React.Component {
  render() {
    let language = this.props.language || '';

    return (
      <div>
        <HomeSplash language={language} />
        <div className="mainContainer">
          <Features  />
          <Showcase language={language} />
          <section className="container paddingBottom" style={{backgroundColor: "#e6e6e6"}}>
              <section className="wrapper" style={{padding: "50px 0 0 0"}}>
                <img src={imgUrl('logo-openstack.png')} style={{height: 70, float: 'left', marginRight: 30}} />
                <a href="/openstack/" style={{display: 'inline-block', marginTop: 20}}>Openstack Drivers</a>
              </section>
          </section>
        </div>
      </div>
    );
  }
}

module.exports = Index;
