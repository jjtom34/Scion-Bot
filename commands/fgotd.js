const { SlashCommandBuilder } = require('@discordjs/builders');
const sequelize = require('sequelize');
const helpers = require('../helpers.js');
const { Op } = require("sequelize");
module.exports = {
	data: new SlashCommandBuilder()
		.setName('fgotd')
		.setDescription('Who is the fgotd'),
	async execute(interaction) {
        await interaction.deferReply();
        // If no user given, default to the user that requested
        const max = await global.fgotd.max('funny_number')
        const rowList = await global.fgotd.findAll({attributes: ['discordid','funny_number'],
                                                    where: {funny_number:max},
                                                    order: [
                                                        ["funny_number","DESC"],
                                                        ["discordid",'ASC']
                                                    ],
                                                    raw: true });
        helpers.printFGOTD(rowList, interaction);
	},
};