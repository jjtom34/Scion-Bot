const { SlashCommandBuilder } = require('@discordjs/builders');
const sequelize = require('sequelize');
const helpers = require('../helpers.js');
const { Op } = require("sequelize");
module.exports = {
	data: new SlashCommandBuilder()
		.setName('fgotd_stats')
		.setDescription('Stats related to fgotd')
                .addIntegerOption(option =>option
                        .setName('time')
                        .setDescription('Time Period')
                        .addChoices(
                                { name: 'Week', value: 2 },
                                { name: 'Month', value: 0 },
                                { name: 'Year', value: 1 },
                        ))
                .addUserOption(option => option.setName('user')
                        .setDescription('Target User')),
	async execute(interaction) {
                await interaction.deferReply();
                
                let time = interaction.options.getInteger('time')
                let user = interaction.options.getUser('user')
                let where_clause = {}
                switch(time){
                        // Month
                        case 0:
                                where_clause.date = {[Op.gt]:Date.now()-(30*24*60*60*1000)}
                                break;
                        // Year
                        case 1:
                                where_clause.date = {[Op.gt]:Date.now()-(365*24*60*60*1000)}
                                break;
                        // Week
                        case 2:
                                where_clause.date = {[Op.gt]:Date.now()-(7*24*60*60*1000)}
                                break; 

                }
                if(user){
                        where_clause.discordid = user.id;
                }
                const rowList = await global.FGOTD_Stats.findAll({attributes: ['discordid',[sequelize.fn('count',sequelize.col('discordid')),'count']],
                                                        where: where_clause,
                                                        group: 'discordid',
                                                        order: [
                                                                ["count","DESC"],
                                                                ["discordid",'ASC']
                                                        ],
                                                        raw: true });
                helpers.printFGOTDStats(rowList,interaction);
	},
};