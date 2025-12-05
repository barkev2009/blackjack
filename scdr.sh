cd client
npm run build
scp -r build/* root@62.217.182.73:/var/www/kidney_diary
cd ..