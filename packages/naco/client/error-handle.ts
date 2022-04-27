import { ComponentPublicInstance } from 'vue';

function defaultErrorHandle(err: Error, instance: ComponentPublicInstance | null, info: string) {
    console.error(err, instance, info);
}
let errorHandle = defaultErrorHandle;

export function vueErrorHandle(err: Error, instance: ComponentPublicInstance | null, info: string) {
    errorHandle(err, instance, info);
}

export function setErrorHandle(
    fn: (err: Error, instance: ComponentPublicInstance | null, info: string) => void,
) {
    errorHandle = fn;
}
