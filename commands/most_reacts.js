const { SlashCommandBuilder } = require('@discordjs/builders');
const sequelize = require('sequelize');
const helpers = require('../helpers.js');
const { Op } = require("sequelize");
module.exports = {
	data: new SlashCommandBuilder()
		.setName('most_reacts')
		.setDescription('Gets the users with the most of a single react')
                .addStringOption(option => option.setName('emote')
                                            .setDescription('Which Emote')
                                            .setRequired(true)),
	async execute(interaction) {
        await interaction.deferReply();
        // If no user given, default to the user that requested
        let emote = interaction.options.getString('emote')
        
        const rowList = await global.react_stats.findAll({attributes: ['discordid','react_id','react_number'],
                                                    where: {react_id:emote},
                                                    order: [
                                                        ["react_number","DESC"],
                                                        ["react_id",'ASC']
                                                    ],
                                                    raw: true });
        const sum = await global.react_stats.sum('react_number',{where: {react_id:emote}})
        helpers.printMostOutput(rowList,sum,interaction);
	},
};