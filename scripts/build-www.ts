import path from 'path';
import { build } from '@zqd/naco/src/build';

build(path.resolve(process.cwd(), 'apps', 'www'))
    .then(() => {
        // return build(path.resolve(process.cwd(), 'views', 'console'));
    })
    .then(() => {
        process.exit(0);
    });
