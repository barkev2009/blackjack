cd server
rm -rf server.tar.gz
tar --exclude='node_modules' -zcvf server.tar.gz .
ssh root@62.217.182.73 "rm -rf kidney-diary-server/*"
scp server.tar.gz root@62.217.182.73:~/kidney-diary-server/server.tar.gz
ssh root@62.217.182.73 "pm2 stop kidney-diary-server; tar -xvzf kidney-diary-server/server.tar.gz -C kidney-diary-server; ls kidney-diary-server; cd kidney-diary-server; npm i; pm2 start pm2.json"
cd ..