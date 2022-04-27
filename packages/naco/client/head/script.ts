import { defineComponent } from 'vue';

export const NacoScript = defineComponent({
    name: 'naco-script',
    props: {
        src: {
            type: String,
            required: true,
        },
    },
    setup() {
        return () => null;
    },
});
