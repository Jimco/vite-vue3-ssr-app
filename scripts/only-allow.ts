#!/usr/bin/env node

/**
 * Detects what package manager executes the process
 * Inspired: https://www.npmjs.com/package/which-pm-runs
 */
function whichPMRuns() {
    const userAgent = process.env.npm_config_user_agent;

    if (!userAgent) {
        return undefined;
    }

    const pmSpec = userAgent.split(' ')[0];
    const separatorPos = pmSpec.lastIndexOf('/');
    const name = pmSpec.substring(0, separatorPos);

    return {
        name: name === 'npminstall' ? 'cnpm' : name,
        version: pmSpec.substring(separatorPos + 1),
    };
}

function log(str: string) {
    console.log('\x1B[31m\n%s\n\x1B[0m', str);
}

const allowPM = ['npm', 'cnpm', 'pnpm', 'yarn'];
const argv = process.argv.slice(2);
if (argv.length === 0) {
    console.log(`Please specify the wanted package manager: only-allow <${allowPM.join('|')}>`);
    process.exit(1);
}

const wantedPM = argv[0];
if (allowPM.indexOf(wantedPM) < 0) {
    console.log(`"${wantedPM}" is not a valid package manager. Available package managers are: npm, cnpm, pnpm, or yarn.`);
    process.exit(1);
}

const usedPM = whichPMRuns();
if (usedPM && usedPM.name !== wantedPM) {
    switch (wantedPM) {
        case 'npm':
        case 'cnpm':
            log(`Use "${wantedPM} install" for installation in this project`);
            break
        case 'pnpm':
            log(`Use "pnpm install" for installation in this project.
If you don't have pnpm, install it via "npm i -g pnpm".
For more details, go to https://pnpm.js.org/`);
            break
        case 'yarn':
            log(`Use "yarn" for installation in this project.
If you don't have Yarn, install it via "npm i -g yarn".
For more details, go to https://yarnpkg.com/`);
            break
    }
    process.exit(1);
}
