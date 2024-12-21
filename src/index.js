const core = require('@actions/core');
const exec = require('@actions/exec');
const fs = require('fs');
const matter = require('gray-matter');
const axios = require('axios');
const path = require('path');

(async function run() {
  try {
    const webhook = core.getInput('wechat_webhook');
    const baseUrl = core.getInput('base_url');
    const blogDir = core.getInput('blog_dir');

    // 定义一个函数，用于从 frontmatter 中提取 slug
    function extractSlugAndTitle(file) {
      const content = fs.readFileSync(file, 'utf-8');
      const frontmatter = matter(content);
      const slug = frontmatter.data.slug || path.basename(file, '.md');
      const title = frontmatter.data.title || file;
      return { slug, title };
    }

    // Run git diff to detect changes
    let addedBlogs = '';
    let updatedBlogs = '';
    let deletedBlogs = '';
    await exec.exec(`git diff --diff-filter=A --name-only HEAD^ | grep '^blog/.*\.md$' || true`, [], {
      listeners: {
        stdout: (data) => {
          const changes = data.toString().trim().split('\n');
          changes.forEach((file) => {
            const { slug, title } = extractSlugAndTitle(file);
            const link = `${baseUrl}/${blogDir}/${slug}`;
            addedBlogs += `- [${title}](${link})\n`;
          });
        },
      },
    });

    await exec.exec(`git diff --diff-filter=M --name-only HEAD^ | grep '^blog/.*\.md$' || true`, [], {
      listeners: {
        stdout: (data) => {
          const changes = data.toString().trim().split('\n');
          changes.forEach((file) => {
            const { slug, title } = extractSlugAndTitle(file);
            const link = `${baseUrl}/${blogDir}/${slug}`;
            updatedBlogs += `- [${title}](${link})\n`;
          });
        },
      },
    });

    await exec.exec(`git diff --diff-filter=D --name-only HEAD^ | grep '^blog/.*\.md$' || true`, [], {
      listeners: {
        stdout: (data) => {
          const changes = data.toString().trim().split('\n');
          changes.forEach((file) => {
            const { slug, title } = extractSlugAndTitle(file);
            const link = `${baseUrl}/${blogDir}/${slug}`;
            deletedBlogs += `- [${title}](${link})\n`;
          });
        },
      },
    });

    if (!addedBlogs && !updatedBlogs && !deletedBlogs) {
      console.log('No blog changes detected.');
      return;
    }

    // Prepare message content
    const message = {
      msgtype: 'markdown',
      markdown: {
        content: ``
      }
    };

    // Send message to WeChat robot
    await axios.post(webhook, message, { headers: { 'Content-Type': 'application/json' } });
    console.log('Notification sent to WeChat robot success.');
  } catch (error) {
    core.setFailed(`Action failed with error: ${error.message}`);
  }
})();
