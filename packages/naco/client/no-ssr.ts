import { defineComponent, ref, onMounted } from 'vue';

export const NacoNoSSR = defineComponent({
    name: 'naco-no-ssr',
    setup(props, ctx) {
        const mounted = ref(false);

        onMounted(() => {
            mounted.value = true;
        });

        return () => (!mounted.value ? null : ctx.slots.default());
    },
});
