const { NewsChannel } = require('discord.js');
const Sequelize = require('sequelize');
const helpers = require('../helpers.js')
module.exports = {
	name: 'voiceStateUpdate',
	async execute(oldState,newState) {
		console.log(newState.channelId)
		console.log(oldState.channelId)
		// bad style but whatevs
		// Start/stop streaming
		// Probably covered by below case but idk?
		if ((newState.channelId === oldState.channelId) && ((newState.streaming && !oldState.streaming) || (!newState.streaming && oldState.streaming))){
			return;
		}
		// If you are just joining a channel/returning from afk, or undeafening/unmuting; start logging time
        else if ((oldState.channelId === null || oldState.channelId === '626946164176060437') 
			&& newState.channelId !== null 
			&& newState.channelId !== '626946164176060437'
			|| (oldState.selfDeaf && !newState.selfDeaf)
			|| (oldState.selfMute && !newState.selfMute)){
			console.log("User Joined");
			try{
				const tag = await global.temp.create({
					discordid: String(newState.id),
					start_time: Date.now()
				});
			}
			catch(err){
				console.log("Something fucked happened")
				console.log(err.message)
				let tempRow = await global.temp.findAll({raw: true })
        		await helpers.deleteTemp(tempRow);
				let temp2 = await oldState.guild.channels.fetch()
        		await helpers.createTemp(temp2);
			}
		}
		// Stop logging when you go to afk, leave or deafen/muting
		else if (newState.channelId === '626946164176060437'
				|| (oldState.channelId !== null && newState.channelId === null) 
				|| (!oldState.selfDeaf && newState.selfDeaf)
				|| (!oldState.selfMute && newState.selfMute)){
			console.log("User Left or is AFK");
			// Fetch the temp row
			const tempRow = await global.temp.findOne({where: { discordid: String(newState.id)}})
			if(tempRow === null){
				return;
			}
			// Calculate the total time
			let loggedTime = Date.now() - tempRow.start_time;
			// Add to permanent time table
			const tag = await global.table.create({
				discordid: String(newState.id),
				start_time: tempRow.start_time,
				time_logged: loggedTime
			});
			// Destroy temp row
			const rowCount = await global.temp.destroy({ where: { discordid: String(newState.id) } });
		}
	},
};

