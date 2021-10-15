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
        helpers.deleteTemp(tempRow);
        interaction.editReply("Logged Everything");
	},
};