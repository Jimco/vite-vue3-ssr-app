const path = require('path');
const fs = require('fs-extra');

const ciTaskRunnerConfig = {
    repository: 'git',
    cache: '../.cache/ci-task-runner/ci-task-runner.json',
    tasks: [],
};

const cwd = process.cwd();
const appsPath = path.resolve(cwd, 'apps');
const packagesPath = path.resolve(cwd, 'packages');
const packages = fs
    .readdirSync(packagesPath)
    .filter((p) => fs.lstatSync(path.join(packagesPath, p)).isDirectory())
    .map((p) => {
        return {
            name: fs.readJSONSync(path.join(packagesPath, p, 'package.json')).name,
            path: path.join(packagesPath, p),
        };
    });

const buildTasks = fs
    .readdirSync(appsPath)
    .filter((p) => fs.lstatSync(path.join(appsPath, p)).isDirectory())
    .map((name) => {
        const pkg = require(path.join(appsPath, name, 'package.json'));
        const allDependencies = Object.keys(
            Object.assign({}, pkg.dependencies || {}, pkg.devDependencies || {}),
        );
        dependencies = packages
            .filter((p) => allDependencies.includes(p.name))
            .map((p) => p.path + '/');

        let buildTask = {
            name: `build_${name}`,
            path: `apps/${name}/`,
            dependencies: dependencies,
            program: `node --require load-es scripts/build-${name}.ts`,
        };

        return buildTask;
    });

ciTaskRunnerConfig.tasks.push(buildTasks);

module.exports = ciTaskRunnerConfig;
