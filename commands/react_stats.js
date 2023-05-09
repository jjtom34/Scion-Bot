const { SlashCommandBuilder } = require('@discordjs/builders');
const sequelize = require('sequelize');
const helpers = require('../helpers.js');
const { Op } = require("sequelize");
module.exports = {
	data: new SlashCommandBuilder()
		.setName('react_stats')
		.setDescription('Get reaction stats for a user')
                .addUserOption(option => option.setName('user')
                                                .setDescription('Target User')),
	async execute(interaction) {
        await interaction.deferReply();
        // If no user given, default to the user that requested
        let user_id = interaction.options.getUser('user') ?? interaction.user;

        const rowList = await global.react_stats.findAll({attributes: ['discordid','react_id','react_number'],
                                                    where: {discordid:user_id.id},
                                                    order: [
                                                        ["react_number","DESC"],
                                                        ["react_id",'ASC']
                                                    ],
                                                    raw: true });
        const sum = await global.react_stats.sum('react_number',{where: {discordid:user_id.id}})
        helpers.printReactOutput(rowList,sum, interaction);
	},
};