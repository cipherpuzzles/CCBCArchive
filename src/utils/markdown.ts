import { marked } from 'marked';

export default function markdownToHtml(markdown: string): string {
    return marked(markdown, {
        mangle: false,
        headerIds: false,
    });
}