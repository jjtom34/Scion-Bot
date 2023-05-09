async function createTemp(temp2) {
    // Take in channels from guild
    // Create a temp row for everyone not in afk
    if(temp2 !== undefined && temp2 !== null){
        for(let newtemp of temp2){
            // For any channel thats not afk
            if(newtemp[1].id !== "626946164176060437" && newtemp[1].type === "GUILD_VOICE"){
                if(newtemp[1].members !== undefined && newtemp[1].members !== null){
                    for(let member of newtemp[1].members){
                        if(!member[1].voice.selfDeaf && !member[1].voice.selfMute){
                            console.log("Creating new temp");
                            console.log(member[1].displayName);
                            try{
                                // Create a new temp for everyone
                                const tag = await global.temp.create({
                                    discordid: String(member[1].id),
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
            }
        }
    }
};
async function deleteTemp(tempRow){
    // Delete all temp rows and finalize work log
    if(tempRow !== null){
        // For every current row
        for(let oldRow of tempRow){
            console.log("Deleting old row")
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
}
async function printOutput(summed_data,interaction){
    let rowString = "";
    await interaction.guild.members.fetch();
    //Sort users by time logged
    summed_data.sort((a,b) => b.total_time - a.total_time);
    
    summed_data.forEach(element => {
        try{
            rowString += "User: " + interaction.guild.members.cache.get(element.discordid).displayName + " | " + Math.round(element.total_time/1000/60) + " minutes logged \n";
        }
        catch(error)
        {
            console.log(error);
        }
    });
    if(rowString === ""){
        interaction.editReply("No results found")
    }
    else{
        interaction.editReply(rowString)
    }
}
async function printReactOutput(summed_data,sum,interaction){
    let rowString = "";
    await interaction.guild.members.fetch();
    rowString += "Total Number of Reacts: " + sum + "\n";
    
    summed_data.forEach(element => {
        try{
            rowString += "User: " + interaction.guild.members.cache.get(element.discordid).displayName + " | " + element.react_id + " | " + element.react_number + "\n";
        }
        catch(error)
        {
            console.log(error);
        }
    });
    if(rowString === ""){
        interaction.editReply("No results found")
    }
    else{
        interaction.editReply(rowString)
    }
}
async function printMostOutput(summed_data,sum,interaction){
    let rowString = "";
    await interaction.guild.members.fetch();
    rowString += "Top Receivers of " + interaction.options.getString('emote') + "\n"
    rowString += "Total Number of " + interaction.options.getString('emote') + ": " + sum + "\n";
    
    summed_data.forEach(element => {
        try{
            rowString += "User: " + interaction.guild.members.cache.get(element.discordid).displayName + " | " + element.react_number + "\n";
        }
        catch(error)
        {
            console.log(error);
        }
    });
    if(rowString === ""){
        interaction.editReply("No results found")
    }
    else{
        interaction.editReply(rowString)
    }
}
async function printFGOTD(data,interaction){
    let rowString = "";
    await interaction.guild.members.fetch();
    rowString += "FGOTD:\n"
    
    data.forEach(element => {
        try{
            rowString += "User: " + interaction.guild.members.cache.get(element.discordid).displayName + " | " + element.funny_number + " <:KEKW:624392576358678529>\n";
        }
        catch(error)
        {
            console.log(error);
        }
    });
    if(rowString === ""){
        interaction.editReply("No results found")
    }
    else{
        interaction.editReply(rowString)
    }
}
async function logFGOTD(){
    global.fgotd.sync();
	global.FGOTD_Stats.sync();
    console.log("running clear")
	const max = await global.fgotd.max('funny_number')
    const rowList = await global.fgotd.findAll({attributes: ['discordid','funny_number'],
													where: {funny_number:max},
                                                    order: [
                                                	["funny_number","DESC"],
                                                    ["discordid",'ASC']
                                                    ],
                                                    raw: true });
    let d = Date.now();
    // Offset by 1 day b/c reset is at 2am
    d -= 1000*60*60*24;
	for(row of rowList){
		const tag = await global.FGOTD_Stats.create({
			discordid: row.discordid,
			funny_number: row.funny_number,
			date: d
		});
	}
    global.fgotd.destroy({
		where: {},
		truncate: true
	});
}
async function printFGOTDStats(data,interaction){
    let rowString = "";
    await interaction.guild.members.fetch();
    rowString += "FGOTD(s):\n"
    
    data.forEach(element => {
        try{
            rowString += "User: " + interaction.guild.members.cache.get(element.discordid).displayName + " | " + element.count + " <:KEKW:624392576358678529>\n";
        }
        catch(error)
        {
            console.log(error);
        }
    });
    if(rowString === ""){
        interaction.editReply("No results found")
    }
    else{
        interaction.editReply(rowString)
    }
}
module.exports = {createTemp, deleteTemp, printOutput,printReactOutput,printMostOutput,printFGOTD,logFGOTD,printFGOTDStats};