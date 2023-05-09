const { SlashCommandBuilder } = require('@discordjs/builders');
const sequelize = require('sequelize');
const helpers = require('../helpers.js');
const { Op } = require("sequelize");
module.exports = {
	data: new SlashCommandBuilder()
		.setName('weekly_fgotd')
		.setDescription('Current Week of FGOTD'),
	async execute(interaction) {
                await interaction.deferReply();
                var prevMonday = new Date();
                prevMonday.setDate(prevMonday.getDate() - (prevMonday.getDay() + 6) % 7);
                const rowList = await global.FGOTD_Stats.findAll({attributes: ['discordid','funny_number','date'],
                                                        where: {date:{[Op.gt]:prevMonday.getTime()}},
                                                        order: [
                                                                ["date","ASC"],
                                                                ["discordid",'ASC']
                                                        ],
                                                        raw: true });
                helpers.printWeeklyFGOTD(rowList,interaction);
	},
};