// module.exports = {
//     apps: [
//         {
//             name: 'frontend', // pm2 name
//             // script: 'node dist/index.js', // // 앱 실행 스크립트
//             script: 'npm run start', // 앱 실행 스크립트
//         },
//     ]
// };

module.exports = {
    apps : [{
      name: "frontend",
      script: "http-server",
      args: "/var/www/frontend/build -p 80",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
    }]
  };
  