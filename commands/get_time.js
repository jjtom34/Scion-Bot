const { SlashCommandBuilder } = require('@discordjs/builders');
const sequelize = require('sequelize');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('standings')
		.setDescription('Gets the total time for everyone'),
	async execute(interaction) {
        const channel = await interaction.channel;
        const rowList = await global.table.findAll({attributes: ['discordid',
                                                                [sequelize.fn('sum', sequelize.col('time_logged')), 'total_time']],
                                                    group:'discordid',
                                                    raw: true })
        console.log(rowList);
        console.log(typeof(rowList));
        let rowString = ""
        rowList.forEach(element => {
            rowString += "User: " + interaction.client.users.cache.get(element.discordid).username + "| " + Math.round(element.total_time/1000/60) + " minutes logged \n";
        });
        interaction.reply(rowString)
	},
};