const { exec } = require('child_process');

module.exports = function (plop) {

    plop.setActionType('install', function (answers, config, plop) {
        return new Promise((resolve, reject) => {
            exec('npm install ' + config.module + ' --save', (err, stdout, stderr) => {
                console.log(stdout);
                if (err) {
                    return reject('install ' + config.module + ' FAIL');
                }
                resolve('install ' + config.module + ' OK');
            });
        });
    });

    plop.setGenerator('install', {
        description: 'install dependencies',
        prompts: [
            {
                type: 'list',
                name: 'dependencies',
                message: 'how much dependencies do you want?',
                choices: [
                    'minimum', 'complete'
                ]
            },

        ],
        actions: function(answers) {
            const actions = [];

            actions.push({type: 'install', module: 'lodash'});

            if (answers.dependencies == 'complete') {
                actions.push({type: 'install', module: 'beefy'});

            }

            return actions;
        }
    });

};
