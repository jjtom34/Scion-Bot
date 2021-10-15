const { SlashCommandBuilder } = require('@discordjs/builders');
const helpers = require('../helpers.js');
const sequelize = require('sequelize');
const { Op } = require("sequelize");
module.exports = {
	data: new SlashCommandBuilder()
		.setName('daily_standings')
		.setDescription('Gets all logged time from the last 24 hours'),
	async execute(interaction) {
        await interaction.deferReply();
        // Immedietly update any existing temps
        
        //First end all temp rows
        let tempRow = await global.temp.findAll({raw: true })
        await helpers.deleteTemp(tempRow);
        
        // Re add everybody in a voice channel
        // First get a list of everyone in a voice channel
        let temp2 = await interaction.guild.channels.fetch()
        await helpers.createTemp(temp2);
        console.log(Date.now()-(7*24*60*60*1000));
        const rowList = await global.table.findAll({attributes: ['discordid',
                                                                [sequelize.fn('sum', sequelize.col('time_logged')), 'total_time']],
                                                    where: {start_time:{[Op.gt]:Date.now()-(24*60*60*1000)}},
                                                    group:'discordid',
                                                    raw: true });
        helpers.printOutput(rowList,interaction);
        
	},
};