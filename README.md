# Nexenta site

## Publish to blog
**IMPORTANT:** use this name format: "YYYY-MM-DD-TITLE.md"

#### On Github
Add file directly on Github: [create new blog post](https://github.com/Nexenta/Nexenta.github.io/new/master/src/website/blog).

#### Locally
```bash
cd src/website/blog/
vim 2018-03-02-my-post-title.md # create new post
# push changes to github
```

## Publish to docs
**IMPORTANT:** use this name format: "TOPIC.md"

#### On Github
Add file directly on Github: [create new docs topic](https://github.com/Nexenta/Nexenta.github.io/new/master/src/docs).

Then edit sidebar file: [edit sidebar](https://github.com/Nexenta/Nexenta.github.io/edit/master/src/website/sidebars.json), add the `id` of the created page to the appropriate section.

#### Locally
```bash
cd src/docs
vim my-new-topic.md # create new topic
vim src/website/sidebars.json # add new topic to the sidebar
# push changes to github
```

## Edit index page

#### On Github
[Edit index page](https://github.com/Nexenta/Nexenta.github.io/edit/master/src/website/pages/en/index.js).

#### Locally
```bash
cd src/website/pages/en
vim index.js
# push changes to github
```
