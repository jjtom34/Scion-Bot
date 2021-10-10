module.exports = {
	name: 'ready',
	once: true,
	async execute(client) {
		console.log(`Ready! Logged in as ${client.user.tag}`);
		await global.table.sync();
		await global.temp.sync();
		// Immedietly update any existing temps
        
        //First end all temp rows
        const tempRow = await global.temp.findAll({raw: true })
        if(tempRow !== null){
            // For every current row
            for(let oldRow of tempRow){
                console.log("Deleting old row")
                console.log(oldRow)
                // Calculate the total time
                let loggedTime = Date.now() - oldRow.start_time;
                // Add to permanent time table
                const tag = await global.table.create({
                    discordid: String(oldRow.discordid),
                    start_time: oldRow.start_time,
                    time_logged: loggedTime
                });
                // Destroy temp row
                const rowCount = global.temp.destroy({ where: { discordid: String(oldRow.discordid) } });
            }
        }
        
        // Re add everybody in a voice channel
        // First get a list of everyone in a voice channel
        let temp2 = await client.guilds.fetch("392106468570300428")
		console.log(temp2)
        if(temp2 !== undefined && temp2 !== null){
            // For everyone in a voice chat right now
            // Add a temp row for them
            for(let newtemp of temp2.voiceStates.cache){
                // For any channel thats not afk
                if(newtemp[1].channelId !== "626946164176060437"){
                    console.log("Creating new temp")
                    console.log(newtemp)
                    try{
                        // Create a new temp for everyone
                        const tag = await global.temp.create({
                            discordid: String(newtemp[1].id),
                            start_time: Date.now()
                        });
                    }
                    catch(err){
                        console.log("Something fucked happened")
                        console.log(err.message)
                    }
                }
            }
        }
	},
};