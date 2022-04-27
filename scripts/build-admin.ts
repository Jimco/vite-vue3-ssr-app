import path from 'path';
import { build } from '@zqd/naco/src/build';

build(path.resolve(process.cwd(), 'apps', 'admin'))
    .then(() => {
        // return build(path.resolve(process.cwd(), 'views', 'console'));
    })
    .then(() => {
        process.exit(0);
    });
