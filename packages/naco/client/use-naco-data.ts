import { inject } from 'vue';

export const useNacoDataKey = 'useNacoDataKey';

export function useNacoData(): { [k: string]: any } {
    return inject(useNacoDataKey) as any;
}
