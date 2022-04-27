import { getCurrentInstance, toRaw, ref, onServerPrefetch } from 'vue';
import { useNacoData } from './use-naco-data';

// type UnwrapNestedRefs<T> = T extends Ref ? T : UnwrapRef<T>;

/**
 * 同构SSR初始数据
 *
 * @export
 * @template T
 * @param {T} initData
 * @param {(state: T) => Promise<T>} initDataFn
 * @returns
 */
export function useAsyncData<T>(initDataFn: () => Promise<T>, options: { initData: T }) {
    const data = ref<T>(options.initData);
    const loading = ref(false);
    const instance = getCurrentInstance();
    const cacheKey = 'I_' + (instance.type as any).id + '_K_' + instance.vnode.key;
    const nacoData = useNacoData();

    if (!nacoData.asyncData) {
        nacoData.asyncData = {};
    }
    if (nacoData.asyncData[cacheKey]) {
        data.value = nacoData.asyncData[cacheKey];
        delete nacoData.asyncData[cacheKey];
    } else {
        if (typeof window === 'undefined') {
            onServerPrefetch(async () => {
                const value = await initDataFn();
                if (value !== undefined) {
                    data.value = value;
                    nacoData.asyncData[cacheKey] = toRaw(value);
                }
            });
        } else {
            loading.value = true;
            initDataFn().then((value) => {
                data.value = value;
                loading.value = false;
            });
        }
    }

    return {
        loading,
        data,
    };
}
