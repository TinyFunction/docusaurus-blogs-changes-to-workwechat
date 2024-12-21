# docusaurus-blogs-changes-to-workwechat-action

[English](./README.md) | [中文](./README_CN.md)

一个用于检测 Docusaurus 博客文章变化并通过企业微信机器人发送通知的 GitHub Action。该插件专为使用 Docusaurus 的博客项目设计，支持检测新增和更新的博客文章，并发送自定义格式的消息到企业微信。

---

## 🚀 功能特点

- **自动检测博客文章变更**：支持新增和更新的博客文章检测。
- **企业微信消息通知**：将变更信息通过企业微信机器人推送到指定群聊。
- **灵活配置**：支持自定义消息模板、博客目录和站点 URL。
- **集成 GitHub Pages**：自动生成可跳转的博客文章链接。

---

## 🛠 使用前提

### 1. 配置 `actions/checkout@v3` 的 `fetch-depth` 参数

要正确检测博客变化，插件需要对比当前提交 (`HEAD`) 和父提交 (`HEAD^`) 的差异。如果 `fetch-depth` 设置为 `1`（仅拉取单次提交），插件会报以下错误：

```
Initial commit detected. Skipping blog change detection.
```

推荐配置如下：

```yaml
- name: Checkout repository
  uses: actions/checkout@v3
  with:
    fetch-depth: 2  # 拉取最近两次提交
```

---

## 📦 输入参数

| **参数名称**         | **描述**                                                                              | **是否必填** | **默认值**                                                                                       |
|----------------------|---------------------------------------------------------------------------------------|--------------|---------------------------------------------------------------------------------------------------|
| `wechat_webhook`     | 企业微信机器人 Webhook 地址。                                                         | ✅ 是        | 无                                                                                               |
| `base_url`           | GitHub Pages 的基础 URL（例如 `https://<yourusername>.github.io/<yourrepo>`）。           | ✅ 是        | 无                                                                                               |
| `blog_dir`           | 博客文章的存储目录。                                                                 | ❌ 否        | `blog`                                                                                            |
| `message_template`   | 自定义的消息模板，支持占位符（如 `${addedBlogs}`、`${updatedBlogs}`、`${github.*}`）。 | ❌ 否        | **见下方默认模板**                                                                                |

### **默认消息模板**
以下是默认的企业微信消息模板：

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

> 你可以根据需要自定义模板，支持 GitHub Actions 上下文变量（如 `${github.*}`）。

---

## 🔧 使用示例

以下是一个完整的 GitHub Actions 配置示例：

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
          fetch-depth: 2  # 确保拉取最近两次提交

      - name: Detect blog changes and send notifications
        uses: TinyFunction/docusaurus-blogs-changes-to-workwechat@v1.0.0
        with:
          wechat_webhook: ${{ secrets.WECHAT_WEBHOOK }}
          base_url: "https://yourusername.github.io/yourrepo"
          blog_dir: "blog"  # 可选参数，默认为 "blog"
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

## 🧩 工作原理

1. **检测博客变化**：插件通过 `git diff` 对比当前提交 (`HEAD`) 和父提交 (`HEAD^`)，识别博客目录中的新增和更新文件。
2. **提取博客信息**：解析 Markdown 文件的 `frontmatter`（例如 `slug` 字段），生成对应的博客 URL。
3. **构造消息**：根据提供的 `message_template` 和检测到的变化，构造企业微信通知的消息内容。
4. **发送通知**：通过企业微信机器人 Webhook 将消息发送到群聊。

---

## 🛠 调试指南

如果插件未正常工作，可尝试以下步骤：
1. 确保 `actions/checkout@v3` 的 `fetch-depth` 配置为 `2` 或 `0`。
2. 检查 GitHub Secrets 是否正确配置了企业微信 Webhook（如 `WECHAT_WEBHOOK`）。
3. 添加调试日志：
   ```yaml
   - name: Debug action
     run: echo "新增博客: ${{ env.addedBlogs }}, 更新博客: ${{ env.updatedBlogs }}"
   ```

---

## 🤝 参与贡献

我们欢迎所有形式的贡献！以下是一些参与方式：

### 1. 报告问题
如果你在使用中遇到任何问题，请通过 [GitHub Issues](https://github.com/your-username/docusaurus-blogs-changes-to-workwechat/issues) 提交。

### 2. 提出功能建议
如果你有改进插件的建议或新功能需求，可以在 Issues 中提交功能请求。

### 3. 提交 Pull Request
- Fork 本仓库。
- 在你的分支中进行修改。
- 提交 Pull Request，并附上修改内容的说明。

---

### 开发指南

1. 克隆项目：
   ```bash
   git clone https://github.com/your-username/docusaurus-blogs-changes-to-workwechat.git
   cd docusaurus-blogs-changes-to-workwechat
   ```

2. 安装依赖：
   ```bash
   npm install
   ```

3. 编译项目：
   ```bash
   npm run build
   ```

4. 本地测试你的更改。

---

## 📝 许可证

本项目基于 [MIT License](https://opensource.org/licenses/MIT) 许可。

---

## 🛡 安全性注意事项

请确保将敏感信息（如 `wechat_webhook`）存储在 GitHub Secrets 中，而不是直接硬编码到工作流配置中。
