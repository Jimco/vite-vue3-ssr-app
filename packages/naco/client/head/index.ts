// import { type } from 'os';
import { defineComponent, onBeforeUnmount, ssrContextKey, inject } from 'vue';
import { useNacoData } from '../use-naco-data';

export { NacoScript } from './script';

export const NacoHead = defineComponent({
    name: 'naco-head',
    setup(props, ctx) {
        if (!ctx.slots.default) return;

        const context = inject(ssrContextKey);

        if (!context.heads) context.heads = new Set();

        const isBrowser = typeof window !== 'undefined';
        let preTitle = '';
        let els: Element[] = [];

        onBeforeUnmount(() => {
            if (preTitle) {
                document.title = preTitle;
            }
            els.forEach((el) => {
                el.parentNode.removeChild(el);
            });
        });

        return () => {
            const nodes = ctx.slots.default();
            if (isBrowser) {
                els = [];
                nodes.forEach((node: any) => {
                    const type = typeof node.type === 'string' ? node.type : node.type.name;

                    switch (type) {
                        case 'title':
                            if (document.title && !preTitle) {
                                preTitle = document.title;
                            }
                            document.title = node.children as string;
                            break;
                        case 'meta':
                            els.push(
                                updateMeta({
                                    type: 'meta',
                                    content: node.children,
                                    attrs: node.props,
                                    queryString: `meta[name="${node.props.name}"]`,
                                }),
                            );
                            break;
                        case 'link':
                            els.push(
                                updateMeta({
                                    type: 'link',
                                    content: node.children,
                                    attrs: node.props,
                                    queryString: `link[href="${node.props.name}"]`,
                                }),
                            );
                            break;
                        case 'naco-script':
                            els.push(
                                updateMeta({
                                    type: 'script',
                                    content: node.children,
                                    attrs: node.props,
                                    queryString: `script[src="${node.props.src}"]`,
                                }),
                            );
                            break;
                        default:
                            console.warn('Head组件中包含不支持的元素类型', node.type);
                    }
                });
            } else {
                nodes.forEach((el: any) => {
                    const type = typeof el.type === 'string' ? el.type : el.type.name;

                    switch (type) {
                        case 'title':
                            context.title = el.children;
                            break;
                        case 'meta':
                            context.heads.add(`<meta${attrToString(el.props)}>`);
                            break;
                        case 'link':
                            context.heads.add(`<link${attrToString(el.props)}>`);
                            break;
                        case 'naco-script':
                            context.heads.add(`<script${attrToString(el.props)}></script>`);
                            break;
                        default:
                            console.warn('Head组件中包含不支持的元素类型', el.type);
                    }
                });
            }
            return null;
        };
    },
});

function attrToString(attr: object) {
    if (!attr) return '';
    return Object.keys(attr).reduce((str, key) => {
        return (str += ` ${key}="${attr[key]}"`);
    }, '');
}

function updateMeta(meta: { type: string; attrs: object; queryString?: string; content?: any }) {
    let el = meta.queryString ? document.head.querySelector(meta.queryString) : null;
    if (!el) {
        el = document.createElement(meta.type);
        const firstElement = document.head.querySelector('link,style,script');
        firstElement ? document.head.insertBefore(el, firstElement) : document.head.appendChild(el);
    }

    if (meta.content) {
        el.innerHTML = meta.content;
    }
    if (meta.attrs) {
        Object.keys(meta.attrs).forEach((key) => {
            el.setAttribute(key, meta.attrs[key]);
        });
    }

    return el;
}
