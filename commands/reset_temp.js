const { SlashCommandBuilder } = require('@discordjs/builders');
const sequelize = require('sequelize');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('reset_temp')
		.setDescription('Logs everything in the temp table'),
	async execute(interaction) {
        await interaction.deferReply();
        // Immedietly update any existing temps
        
        //First end all temp rows
        let tempRow = await global.temp.findAll({raw: true })
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
        interaction.editReply("Logged Everything");
	},
};