const { ClusterManager } = require('discord-hybrid-sharding');
require('dotenv').config();

const manager = new ClusterManager(`${__dirname}/index.js`, {
    totalShards: 'auto',
    shardsPerClusters: 2,
    mode: 'process', 
    token: process.env.TOKEN,
});

manager.on('clusterCreate', cluster => console.log(`Launched Cluster ${cluster.id}`));
manager.spawn({ timeout: -1 });