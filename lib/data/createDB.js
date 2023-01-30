const cp = require('child_process');

cp.execSync('./lib/data/create-connections-db.sh');
cp.execSync('./lib/data/load-users.sh');
cp.execSync('./lib/data/load-contacts.sh');
cp.execSync('./lib/data/load-objectives.sh');
