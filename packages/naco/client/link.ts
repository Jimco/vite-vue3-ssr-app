import { defineComponent, h } from 'vue';
import { useRouter } from 'vue-router';

export const NacoLink = defineComponent({
    props: {
        href: {
            type: String,
            required: true,
        },
    },
    setup(props, ctx) {
        const router = useRouter();

        const onClick = (e: MouseEvent) => {
            if (/^(https?)?:?\/\//.test(props.href)) {
                return;
            }
            e.preventDefault();
            router.push(props.href);
        };

        return () => h('a', { ...props, onClick }, ctx.slots.default && ctx.slots.default());
    },
});
