import { defineConfig, defineDocs } from 'fumadocs-mdx/config';

export const docs = defineDocs({
  dir: 'content/docs',
});

export const pages = defineDocs({
  dir: 'content/pages',
});

export const posts = defineDocs({
  dir: 'content/posts',
});

export const logs = defineDocs({
  dir: 'content/logs',
});

export default defineConfig({
  mdxOptions: {
    rehypeCodeOptions: {
      themes: {
        light: 'github-light',
        dark: 'github-dark',
      },
      // 只包含必要的语言以减小打包大小
      langs: ['typescript', 'javascript', 'json', 'bash', 'tsx', 'jsx', 'html', 'css'],
      // Use defaultLanguage for unknown language codes
      defaultLanguage: 'plaintext',
    },
  },
});
