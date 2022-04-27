const path = require('path');

if (process.env.NODE_ENV === 'production') {
    createTracer({
        serviceName: 'gaoding-open-platform',
    });
}

require('dotenv').config({
    path: path.resolve(process.cwd(), 'server', '.env'),
});

require('./main');
