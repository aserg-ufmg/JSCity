# provision_script.sh
apt-get update
debconf-set-selections <<< 'mysql-server mysql-server/root_password password your_password'
debconf-set-selections <<< 'mysql-server mysql-server/root_password_again password your_password'
apt-get -y install mysql-server
apt-get -y install nodejs
cd /vagrant
/usr/bin/mysql --user=root --password=your_password < sql/schema.sql
/usr/bin/perl -i.bak -ne 's/"password": ""/"password": "your_password"/g; print;' js/config.json
/usr/bin/nodejs js/server.js > /var/log/node-server-log.log 2>&1 &
echo ""
echo "------------------------------------------------------"
echo "You can now visit http://localhost:8080 to see a city!"
echo "------------------------------------------------------"
echo ""
