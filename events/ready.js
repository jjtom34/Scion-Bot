const helpers = require('../helpers.js');

module.exports = {
	name: 'ready',
	once: true,
	async execute(client) {
        
		console.log(`Ready! Logged in as ${client.user.tag}`);
		await global.table.sync();
		await global.temp.sync();
		// Immedietly update any existing temps
        
        //First end all temp rows
        let tempRow = await global.temp.findAll({raw: true })
        await helpers.deleteTemp(tempRow);
        
        // Re add everybody in a voice channel
        // First get a list of everyone in a voice channel
        let guild = await client.guilds.fetch("392106468570300428")
        let temp2 = await guild.channels.fetch();
        await guild.emojis.fetch();
        await helpers.createTemp(temp2);
        
        
        // Reactions -> cache-> users ->cache to get 
	},
};