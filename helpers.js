async function createTemp(temp2) {
    // Take in channels from guild
    // Create a temp row for everyone not in afk
    if(temp2 !== undefined && temp2 !== null){
        for(let newtemp of temp2){
            // For any channel thats not afk
            if(newtemp[1].id !== "626946164176060437" && newtemp[1].type === "GUILD_VOICE"){
                if(newtemp[1].members !== undefined && newtemp[1].members !== null){
                    for(let member of newtemp[1].members){
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
        interaction.editreply("No results found")
    }
    else{
        interaction.editReply(rowString)
    }
}
module.exports = {createTemp, deleteTemp, printOutput};