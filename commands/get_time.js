const { SlashCommandBuilder } = require('@discordjs/builders');
const sequelize = require('sequelize');
const helpers = require('../helpers.js');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('standings')
		.setDescription('Gets the total time for everyone'),
	async execute(interaction) {
        await interaction.deferReply();
        // Immedietly update any existing temps
        
        //First end all temp rows
        let tempRow = await global.temp.findAll({raw: true })
        let temp2 = await interaction.guild.channels.fetch()
        await helpers.deleteTemp(tempRow);
        
        // Re add everybody in a voice channel
        // First get a list of everyone in a voice channel
        await helpers.createTemp(temp2);
        
        const rowList = await global.table.findAll({attributes: ['discordid',
                                                                [sequelize.fn('sum', sequelize.col('time_logged')), 'total_time']],
                                                    group:'discordid',
                                                    raw: true });
       helpers.printOutput(rowList,interaction);
	},
};