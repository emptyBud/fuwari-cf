---
title: 使用哔哩哔哩图床优化你的博客（迫真）
published: 2025-08-19
description: '还在为博客图片存储发愁？教你使用哔哩哔哩图床免费存储图片！'
image: 'https://i0.hdslb.com/bfs/archive/eb1b9ba5ee0e17f85c75a41d1b8a9a6cf0de5bf4.jpg'
tags: ["小巧思","Fuwari","博客","哔哩哔哩"]
category: '赛博人生'
draft: false 
lang: ''
---

> **免责声明**：本文章的所有内容具有时效性和道德争议性，**请谨慎使用！**
> **重要提示**：本方案依赖第三方服务，**可能随时失效**，请谨慎使用！

# 前情提要

## 背景（废话）

本人因受 [二叉树树](https://www.2x.nz/posts/fuwari/) 影响，考虑写博客记录生活（实则早已把QQ空间当成博客 /雾）。但因一些限制，本人用不了 赛博菩萨Cloudflare的R2存储（其实就是没有银行卡），这就导致博客的图片传输成了一大问题。作为 Bilibili API Collect 的长期潜在共享者之一，我的潜意识告诉我，相比于 可能被刷且过于昂贵的国内对象存储 和 毫不稳定的第三方图站，允许空 Referer 的哔哩哔哩图站 `hdslb.com` 显然是个更优的选择（并不

## 注意事项

本方法不适用于有以下需求的大佬

- 需要图片无损的（哔哩哔哩常规方式上传图片会转码，略微压缩）

- 有除了图片以外其他存储需求的

- 博客有极大量访问的，且内容及其重要的

# 实现方法

## 哔哩哔哩端

每次写完博客，前往 [哔哩哔哩动态](https://t.bilibili.com/) 上传博客所需图片，并点击发表动态（可以修改可见范围为“仅自己可见”），右键复制图像链接，拷贝到形如 `https://i0.hdslb.com/bfs/new_dyn/3c56f49711ce5d0ef6a03a67994166e2325903362.jpg@784w_1044h.webp` 的链接后，去除 `@` 及后面的所有字符（如果没有就不用去）

在Markdown中，使用形如下方的格式来代替 `![图片说明](你的链接)` 即可

```html
<img src='你的链接' alt="图片说明" referrerpolicy='no-referrer' />
```

## Fuwari端

但仅仅解决了文章中的图片还不够，我们还有封面图，而封面图不能用 HTML格式 来规避 Referer问题。就真的毫无解决方法了吗？

---

通过本地调试发现，处理封面图片的程序就在 Fuwari 项目的 `./src/components/misc/ImageWrapper.astro` 的最后一段（当前版本第53行）

```Astro
{!isLocal && <img src={isPublic ? url(src) : src} alt={alt || ""} class={imageClass} style={imageStyle} }
```

只需将其略作修改，改为如下即可

```astro
{!isLocal && <img src={isPublic ? url(src) : src} alt={alt || ""} class={imageClass} style={imageStyle} referrerpolicy="no-referrer" />}
```

这样，就可以解决封面图带 Referer 的问题了。

# 最后

该方法不保证强可用性，说不定哪天就不让空 Referer 访问了。

另外，强烈建议有条件的佬使用Cloudflare的R2存储 + avif图片压缩以获得最优体验。
