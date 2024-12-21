# docusaurus-blogs-changes-to-workwechat-action

[English](./README.md) | [中文](./README_CN.md)

A GitHub Action to detect changes in Docusaurus blog posts and send notifications to a Work-WeChat robot. This action is specifically designed for projects using Docusaurus with blogs stored in a specified directory (default: `blog`).

---

## 🚀 Features

- Detects **newly added** and **updated** blog posts in your Docusaurus blog directory.
- Sends notifications with a customizable message template to a Work-WeChat robot.
- Supports integration with GitHub Pages for generating blog URLs.
- Fully configurable inputs for flexibility in different Docusaurus setups.

---

## 🛠 Prerequisites

### 1. Use `actions/checkout@v3` with `fetch-depth` set to `0` or a value greater than `1`.

To properly detect blog changes, this action requires the ability to compare the current commit (`HEAD`) with its parent commit (`HEAD^`). If the repository has only one commit (e.g., in a shallow clone with `fetch-depth: 1`), the action will output:

```
Initial commit detected. Skipping blog change detection.
```

Here is how you should configure `actions/checkout@v3` in your workflow:

```yaml
- name: Checkout repository
  uses: actions/checkout@v3
  with:
    fetch-depth: 2  # Recommended: fetch at least the last two commits
```

---

## 📦 Inputs

| **Input Name**      | **Description**                                                                             | **Required** | **Default**                                                                                       |
|----------------------|---------------------------------------------------------------------------------------------|--------------|---------------------------------------------------------------------------------------------------|
| `wechat_webhook`     | The webhook URL for your Work-WeChat robot.                                                | ✅ Yes       | N/A                                                                                               |
| `base_url`           | The base URL of your GitHub Pages site (e.g., `https://<yourusername>.github.io/<yourrepo>`).  | ✅ Yes       | N/A                                                                                               |
| `blog_dir`           | The directory where your blog posts are stored.                                            | ❌ No        | `blog`                                                                                            |
| `message_template`   | The template of the message to send. Supports placeholders for `addedBlogs`, `updatedBlogs`, `github.*` variables. | ❌ No        | **See default template below.**                                                                  |

### **Default Message Template**
The default message template for Work-WeChat notifications is:

```
**📢 博客变更通知**
分支: ${github.ref_name}
提交信息: ${github.event.head_commit.message}
提交人: ${github.actor}

**新增博客文章**:
${addedBlogs || '无新增博客'}

**更新博客文章**:
${updatedBlogs || '无更新博客'}
```

You can customize this template to match your requirements. All `${github.*}` variables correspond to GitHub Actions' context variables.

---

## 🔧 Example Usage

Here is an example of how to use `docusaurus-blogs-changes-to-workwechat-action` in a GitHub Actions workflow:

```yaml
name: Blog Changes Notifier

on:
  push:
    branches:
      - main

jobs:
  notify:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v3
        with:
          fetch-depth: 2  # Ensure we can compare HEAD with HEAD^

      - name: Detect blog changes and send notifications
        uses: TinyFunction/docusaurus-blogs-changes-to-workwechat-action@v1
        with:
          wechat_webhook: ${{ secrets.WECHAT_WEBHOOK }}
          base_url: "https://yourusername.github.io/yourrepo"
          blog_dir: "blog"  # Optional: Defaults to "blog"
          message_template: |
            **📢 博客变更通知**
            仓库: ${github.repository}
            分支: ${github.ref_name}
            提交人: ${github.actor}

            **新增博客文章**:
            ${addedBlogs || '无新增博客'}

            **更新博客文章**:
            ${updatedBlogs || '无更新博客'}
```

---

## 🧩 How It Works

1. The action runs `git diff` to compare the current commit (`HEAD`) with its parent (`HEAD^`).
2. It detects changes in the specified blog directory (default: `blog`) and categorizes files into:
   - **New Blog Posts**: Newly added Markdown files.
   - **Updated Blog Posts**: Modified Markdown files.
3. It parses the `frontmatter` of each Markdown file to extract the `slug` (or uses the file name if `slug` is missing).
4. It constructs URLs for the changed blog posts using the provided `base_url`.
5. It sends a Work-WeChat notification using the `wechat_webhook` URL, with the message content based on the `message_template`.

---

## 🛠 Debugging

If something goes wrong, the following steps can help:
- Ensure `fetch-depth` is set to `2` or `0` in `actions/checkout@v3`.
- Check the Work-WeChat webhook URL in your GitHub Secrets (`WECHAT_WEBHOOK`).
- Add debug logs to your workflow:
  ```yaml
  - name: Debug action
    run: echo "Added Blogs: ${{ env.addedBlogs }}, Updated Blogs: ${{ env.updatedBlogs }}"
  ```

---

## 🤝 Contributing

We welcome contributions! Here’s how you can get involved:

1. **Report Bugs**: If you encounter any issues, please open an issue in the [GitHub repository](https://github.com/TinyFunction/docusaurus-blogs-changes-to-workwechat/issues).
2. **Suggest Features**: Have an idea to improve this action? Open a feature request in the Issues section.
3. **Submit Pull Requests**:
   - Fork the repository.
   - Make your changes.
   - Submit a pull request with a clear explanation of the changes.

### Development Guide

1. Clone the repository:
   ```bash
   git clone https://github.com/TinyFunction/docusaurus-blogs-changes-to-workwechat.git
   cd docusaurus-blogs-changes-to-workwechat
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the project:
   ```bash
   npm run build
   ```

4. Test your changes locally.

---

## 📝 License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).

---

## 🛡 Security

Ensure that sensitive data like `wechat_webhook` is stored securely in GitHub Secrets and not hardcoded in workflows.
