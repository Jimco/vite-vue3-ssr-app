import { pick } from 'lodash-es';

export * from './create-context';
export * from './define-controller';

interface Node {
    [k: string]: any;
}

export function treePick(tree: Node, keys: string[], childrenKey = 'children') {
    const node = pick(tree, keys);
    if (Array.isArray(tree[childrenKey])) {
        node[childrenKey] = tree[childrenKey].map((n) => treePick(n, keys, childrenKey));
    }
    return node;
}
