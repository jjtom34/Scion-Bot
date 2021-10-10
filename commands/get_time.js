const { SlashCommandBuilder } = require('@discordjs/builders');
const sequelize = require('sequelize');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('standings')
		.setDescription('Gets the total time for everyone'),
	async execute(interaction) {

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
        let temp2 = await interaction.guild.fetch("392106468570300428")
        if(temp2 !== undefined && temp2 !== null){
            // For everyone in a voice chat right now
            // Add a temp row for them
            for(let newtemp of temp2.voiceStates.cache){
                // For any channel thats not afk
                if(newtemp[1].channelId !== "626946164176060437" && newtemp[1].channelID !== null){
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
        
        const rowList = await global.table.findAll({attributes: ['discordid',
                                                                [sequelize.fn('sum', sequelize.col('time_logged')), 'total_time']],
                                                    group:'discordid',
                                                    raw: true })
        let rowString = ""
        
        // Get all usernames
        let temp = await interaction.guild.members.fetch()

        rowList.forEach(element => {
            rowString += "User: " + interaction.client.users.cache.get(element.discordid).username + " | " + Math.round(element.total_time/1000/60) + " minutes logged \n";
        });
        if(rowString === ""){
            interaction.reply("No results found")
        }
        else{
            interaction.reply(rowString)
        }
	},
};