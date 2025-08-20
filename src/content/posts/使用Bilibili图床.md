---
title: 使用哔哩哔哩图床优化你的博客（迫真）
published: 2025-08-20
description: '还在为博客图片存储发愁？教你使用哔哩哔哩图床免费存储图片！'
image: 'https://i0.hdslb.com/bfs/archive/eb1b9ba5ee0e17f85c75a41d1b8a9a6cf0de5bf4.jpg'
tags: ["小巧思","Fuwari","博客","哔哩哔哩","修改程序"]
category: '赛博人生'
draft: false 
lang: ''
---

> **免责声明**：本文章的所有内容具有时效性和道德争议性，**请谨慎使用！**
>
> **重要提示**：本方案依赖 *不是辣么稳定的* 第三方服务，**可能随时失效**，请谨慎使用！

# 前情提要

## 背景（废话）

本人因受 [二叉树树](https://www.2x.nz/posts/fuwari/) 影响，考虑写博客记录生活（实则早已把QQ空间当成博客 /雾）。但因一些限制，本人用不了赛博菩萨 Cloudflare 的 R2 存储（其实就是没有银行卡），这就导致博客的图片传输成了一大问题。作为 Bilibili API Collect 的长期潜在共享者之一，我的潜意识告诉我，相比于 可能被刷且过于昂贵的国内对象存储 和 毫不稳定的第三方图站，允许空 Referer 的哔哩哔哩图站 `hdslb.com` 显然是个更优的选择**（并不**

## 注意事项

本方法不适用于有以下需求的大佬

- 需要图片无损的（哔哩哔哩常规方式上传图片会转码，略微压缩）

- 有除了图片以外其他存储需求的

- 博客有极大量访问的，且内容及其重要的

# 实现方法

## 哔哩哔哩端

每次写完博客，前往 [哔哩哔哩动态](https://t.bilibili.com/) 上传博客所需图片，并点击发表动态（可以修改可见范围为“仅自己可见”），右键复制图像链接，拷贝到形如 `https://i0.hdslb.com/bfs/new_dyn/3c56f49711ce5d0ef6a03a67994166e2325903362.jpg@784w_1044h.webp` 的链接后，去除 `@` 及后面的所有字符（如果没有就不用去）

也可保留为 `https://i0.hdslb.com/bfs/new_dyn/3c56f49711ce5d0ef6a03a67994166e2325903362.jpg@.webp`，有损压缩，大幅减少传输占用（`3.22 MB -> 241 KB`）。

如果你不想看下文长篇大论，对你的 Fuwari 自身进行修改，你可以在Markdown中，直接使用形如下方的格式来代替 `![图片说明](你的链接)`。

```html
<img src='你的链接' alt="图片说明" referrerpolicy='no-referrer' />
```

## Fuwari端

仅仅解决了文章中的图片还不够，我们还有封面图，而封面图不能用 HTML格式 来规避 Referer问题。就真的毫无解决方法了吗？

通过本地调试发现，处理封面图片的程序就在 Fuwari 项目的 `./src/components/misc/ImageWrapper.astro` 的最后一段（当前版本第53行）

```astro
{!isLocal && <img src={isPublic ? url(src) : src} alt={alt || ""} class={imageClass} style={imageStyle} }
```

只需将其略作修改，改为如下即可

```astro
{!isLocal && <img src={isPublic ? url(src) : src} alt={alt || ""} class={imageClass} style={imageStyle} referrerpolicy="no-referrer" />}
```

这样，就可以解决封面图带 Referer 的问题了。

---

可是如果每次写博客都要用 `<img>` 标签去写图片，可就比较复杂了。有没有什么一劳永逸的方式呢？

**当然有！** 而且并不复杂。

剪水不才，但通过仔细的代码分析（当然也只是走马观花），终于发现，Fuwari 本身好像并没有对图片的特殊处理。所以，要对 `<img>` 标签添加 `referrerpolicy` 就只能自己写中间键了。

在利用 AI 与自身的认知调用之后，我成功了！

以下是详细的修改流程：

1. 添加文件 `./src/plugins/rehype-img-no-referrer.js` ，并写入以下代码

    ```astro
    // ./src/plugins/rehype-img-no-referrer.js
    import { visit } from 'unist-util-visit';
    
    /**
     * 一个简单的 Rehype 插件，为所有 img 标签添加 referrerpolicy="no-referrer" 属性，注释都是 AI 写的
     */
    export function rehypeImgNoReferrer() {
      return (tree) => {
        visit(tree, (node) => {
          // 检查节点是否为 HTML 元素且标签名是 'img'
          if (node.type === 'element' && node.tagName === 'img') {
            // 确保 properties 对象存在
            node.properties = node.properties || {};
            // 添加或覆盖 referrerpolicy 属性
            node.properties.referrerpolicy = 'no-referrer';
          }
        });
      };
    }
    ```

2. 修改根目录下的文件 `astro.config.mjs` ，在开头的一堆 `import ...` 后面加上一行

    ```astro
    // ./astro.config.mjs
    import { rehypeImgNoReferrer } from "./src/plugins/rehype-img-no-referrer.js";
    ```

    并在后面的 `defineConfig` 中使用你的中间件

    ```astro
    // ./astro.config.mjs
    export default defineConfig({
      // ... 其他配置
      markdown: {
        rehypePlugins: [
          // ... 其他 rehype 插件
          rehypeImgNoReferrer // [[[这一行添加我们的插件]]]
        ],
        // ...
      }
    });
    ```

这里呢，也怕我写得不太清楚，所以在这里也贴出我的 `astro.config.mjs` 全部内容以供参考。
```astro
// ./astro.config.mjs
import sitemap from "@astrojs/sitemap";
import svelte from "@astrojs/svelte";
import tailwind from "@astrojs/tailwind";
import { pluginCollapsibleSections } from "@expressive-code/plugin-collapsible-sections";
import { pluginLineNumbers } from "@expressive-code/plugin-line-numbers";
import swup from "@swup/astro";
import expressiveCode from "astro-expressive-code";
import icon from "astro-icon";
import { defineConfig } from "astro/config";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeComponents from "rehype-components"; /* Render the custom directive content */
import rehypeKatex from "rehype-katex";
import rehypeSlug from "rehype-slug";
import remarkDirective from "remark-directive"; /* Handle directives */
import remarkGithubAdmonitionsToDirectives from "remark-github-admonitions-to-directives";
import remarkMath from "remark-math";
import remarkSectionize from "remark-sectionize";
import { expressiveCodeConfig } from "./src/config.ts";
import { pluginLanguageBadge } from "./src/plugins/expressive-code/language-badge.ts";
import { AdmonitionComponent } from "./src/plugins/rehype-component-admonition.mjs";
import { GithubCardComponent } from "./src/plugins/rehype-component-github-card.mjs";
import { parseDirectiveNode } from "./src/plugins/remark-directive-rehype.js";
import { remarkExcerpt } from "./src/plugins/remark-excerpt.js";
import { remarkReadingTime } from "./src/plugins/remark-reading-time.mjs";
import { pluginCustomCopyButton } from "./src/plugins/expressive-code/custom-copy-button.js";
// 导入自定义的rehype插件
import { rehypeImgNoReferrer } from "./src/plugins/rehype-img-no-referrer.js";



// https://astro.build/config
export default defineConfig({
	site: "https://blog.evira.top",
	base: "/",
	trailingSlash: "always",
	integrations: [
		tailwind({
			nesting: true,
		}),
		swup({
			theme: false,
			animationClass: "transition-swup-", // see https://swup.js.org/options/#animationselector
			// the default value `transition-` cause transition delay
			// when the Tailwind class `transition-all` is used
			containers: ["main", "#toc"],
			smoothScrolling: true,
			cache: true,
			preload: true,
			accessibility: true,
			updateHead: true,
			updateBodyClass: false,
			globalInstance: true,
		}),
		icon({
			include: {
				"preprocess: vitePreprocess(),": ["*"],
				"fa6-brands": ["*"],
				"fa6-regular": ["*"],
				"fa6-solid": ["*"],
			},
		}),
		expressiveCode({
			themes: [expressiveCodeConfig.theme, expressiveCodeConfig.theme],
			plugins: [
				pluginCollapsibleSections(),
				pluginLineNumbers(),
				pluginLanguageBadge(),
				pluginCustomCopyButton()
			],
			defaultProps: {
				wrap: true,
				overridesByLang: {
					'shellsession': {
						showLineNumbers: false,
					},
				},
			},
			styleOverrides: {
				codeBackground: "var(--codeblock-bg)",
				borderRadius: "0.75rem",
				borderColor: "none",
				codeFontSize: "0.875rem",
				codeFontFamily: "'JetBrains Mono Variable', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
				codeLineHeight: "1.5rem",
				frames: {
					editorBackground: "var(--codeblock-bg)",
					terminalBackground: "var(--codeblock-bg)",
					terminalTitlebarBackground: "var(--codeblock-topbar-bg)",
					editorTabBarBackground: "var(--codeblock-topbar-bg)",
					editorActiveTabBackground: "none",
					editorActiveTabIndicatorBottomColor: "var(--primary)",
					editorActiveTabIndicatorTopColor: "none",
					editorTabBarBorderBottomColor: "var(--codeblock-topbar-bg)",
					terminalTitlebarBorderBottomColor: "none"
				},
				textMarkers: {
					delHue: 0,
					insHue: 180,
					markHue: 250
				}
			},
			frames: {
				showCopyToClipboardButton: false,
			}
		}),
        svelte(),
		sitemap(),
	],
	markdown: {
		remarkPlugins: [
			remarkMath,
			remarkReadingTime,
			remarkExcerpt,
			remarkGithubAdmonitionsToDirectives,
			remarkDirective,
			remarkSectionize,
			parseDirectiveNode,
		],
		rehypePlugins: [
			rehypeKatex,
			rehypeSlug,
			[
				rehypeComponents,
				{
					components: {
						github: GithubCardComponent,
						note: (x, y) => AdmonitionComponent(x, y, "note"),
						tip: (x, y) => AdmonitionComponent(x, y, "tip"),
						important: (x, y) => AdmonitionComponent(x, y, "important"),
						caution: (x, y) => AdmonitionComponent(x, y, "caution"),
						warning: (x, y) => AdmonitionComponent(x, y, "warning"),
					},
				},
			],
			[
				rehypeAutolinkHeadings,
				{
					behavior: "append",
					properties: {
						className: ["anchor"],
					},
					content: {
						type: "element",
						tagName: "span",
						properties: {
							className: ["anchor-icon"],
							"data-pagefind-ignore": true,
						},
						children: [
							{
								type: "text",
								value: "#",
							},
						],
					},
				},
			],
            rehypeImgNoReferrer,
		],
	},
	vite: {
		build: {
			rollupOptions: {
				onwarn(warning, warn) {
					// temporarily suppress this warning
					if (
						warning.message.includes("is dynamically imported by") &&
						warning.message.includes("but also statically imported by")
					) {
						return;
					}
					warn(warning);
				},
			},
		},
	},
});

```





# 最后

该方法不保证强可用性，说不定哪天就不让空 Referer 访问了。

另外，强烈建议有条件的佬使用 Cloudflare 的 R2 存储 + avif图片压缩以获得最优体验。

