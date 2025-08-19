---
title: 记一次 Fiddler 抓包 HTTPS 错误排查
published: 2025-08-19
description: 'Fiddler无法抓取HTTPS包？别急！本文提供三大问题排查方案'
image: 'https://i0.hdslb.com/bfs/archive/a816fd4ab7ac5df407b3b095b0141c3a0bff5f4e.jpg'
tags: ["Fiddler","抓包","错误排查"]
category: '赛博人生'
draft: false 
lang: ''
---

# 前情提要

1. 此处仅讨论 Fiddler Classic，即使 Fiddler Everywhere 也可能出现类似问题。

2. 本人的 Fiddler 并非官方渠道，且安装了其他的插件，问题也是出现与此。理论上来讲，完全卸载后，换个文件夹安装 [官方 Fiddler](https://www.telerik.com/download/fiddler) 也可以解决这个问题。
  

# 背景

今天如往常一样打开了我的 Fiddler，却发现它抓包抓不了HTTPS，在 `Tunnel to` 中出现了这样的提示：

```Fiddler
This is a CONNECT tunnel, through which encrypted HTTPS traffic flows.
Fiddler's HTTPS Decryption feature is enabled, but this specific tunnel was configured not to be decrypted. Settings can be found inside Tools > Options > HTTPS.

A SSLv3-compatible ServerHello handshake was found. Fiddler extracted the parameters below.
...
```

随后在搜索了无数的教程，累计重装证书并重启电脑十余次之后，终于，找到了问题所在……

# 本人排查流程

> 或许你可以参考排查（虽然这都不是什么正经错误原因

## 协议不兼容

在一般的 Fiddler 中是默认不抓 TLS1.2 协议的，但某些网站禁用了 TLS1.1，导致抓包后无法正常使用。

这种情况只需要去 `Tools > Options > HTTPS` 里修改 `Protocols`，在后面加上 `;tls1.2` 就可以

<img src='http://i0.hdslb.com/bfs/new_dyn/12a4dc2c67eef03314c42461140854781754348361.png' alt="Fiddler HTTPS Protocols Setting" referrerpolicy='no-referrer' />


## 不可名状的手残

这一原因很少发生，但一旦发生，也很难排查出来。在 `Tools > Options > HTTPS` 中，最下面有一个 **<font color="blue">Skip decryption</font> for the following hosts** 的字样，如果你看到这个，说明你不是这个原因（）

如果你在 `Tools > Options > HTTPS` 中看到的是 **<font color="blue">Perform decryption</font> for the following hosts** 的字样，就说明，此时你的 Fiddler 是白名单机制，只会对下面那个框框里的域名进行 HTTPS 解析，那你点击一下这个蓝色的字，让它变成 **<font color="blue">Skip decryption</font>** 就好了。

<img src='http://i0.hdslb.com/bfs/new_dyn/4a70e252569d260973235c8ec467cf781754348361.png' alt="Fiddler Decryption Mode Setting" referrerpolicy='no-referrer' />

## 疑似证书插件过期

如果你与我一样，使用的是很早之前 52破解的汉化版，或者你的 Fiddler 根目录下有 `BCMakeCert.dll` 和 `CertMaker.dll` 的，那问题大概是这两者的问题，这两个证书插件不知道为什么出现了问题（可能是时间久了，变质了罢）。

总之，把这两个文件从根目录删掉就可以，然后打开 Fiddler，在 `Tools > Options > HTTPS` 中修改证书生成即可（其实大概你删掉这两个文件之后，Fiddler 就会自动修改）。

<img src='http://i0.hdslb.com/bfs/new_dyn/6f72fbffdaa62abcf6b067a270c272821754348361.png' alt="Fiddler CertMaker Settings" referrerpolicy='no-referrer' />

# 最后

还是建议在每一次修改后重置证书（`Tools > Options > HTTPS > Actions > Reset Certificates`），以排除证书问题。

