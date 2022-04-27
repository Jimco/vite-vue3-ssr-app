import { useSSRContext, reactive, watch } from 'vue';

export interface IMeta {
    title: string;
    keywords: string;
    description: string;
}
export function useMeta(meta?: IMeta) {
    const ssrContext = useSSRContext();

    const state = reactive<IMeta>(
        meta || {
            title: '',
            keywords: '',
            description: '',
        },
    );

    ssrContext.meta = state;

    if (typeof window !== 'undefined') {
        watch(state, (newMeta, _) => {
            document.title = newMeta.title;
            updateMeta({
                type: 'meta',
                attrs: { content: newMeta.keywords },
                queryString: 'meta[name="keywords"]',
            });
            updateMeta({
                type: 'meta',
                attrs: { content: newMeta.description },
                queryString: 'meta[name="description"]',
            });
        });
    }

    return state;
}

function updateMeta(meta: { type: string; attrs: object; queryString: string }) {
    let el = document.head.querySelector(meta.queryString);
    if (!el) {
        el = document.createElement(meta.type);
        document.head.appendChild(el);
    }

    Object.keys(meta.attrs).forEach((key) => {
        el.setAttribute(key, meta.attrs[key]);
    });
}
