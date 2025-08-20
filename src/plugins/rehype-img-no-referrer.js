// src/plugins/rehype-img-no-referrer.js
import { visit } from 'unist-util-visit';

/**
 * 一个简单的 Rehype 插件，为所有 img 标签添加 referrerpolicy="no-referrer" 属性
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
        
        // 如果你想同时添加其他属性，比如 loading="lazy"，也可以在这里进行
        // node.properties.loading = node.properties.loading || 'lazy';
      }
    });
  };
}