const Sequelize = require('sequelize');
module.exports = {
	name: 'voiceStateUpdate',
	async execute(oldState,newState) {
        if (oldState.channelId === null && newState.channelId !== null){
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
			}
		}
		else if ((oldState.channelId !== null && newState.channelId === null) || newState.channelId === 626946164176060437){
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

