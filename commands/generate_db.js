const { SlashCommandBuilder } = require('@discordjs/builders');
const sequelize = require('sequelize');
const fetchAll = require('discord-fetch-all');
module.exports = {
	    data: new SlashCommandBuilder()
            .setName('generate_db')
            .setDescription('WARNING: DO NOT USE IF NOT JOHNNY OR CAMERON'),
	    async execute(interaction) {
            await interaction.deferReply();
            await global.react_stats.sync();
            // Get All Messages in a channel
            let guild = await interaction.guild
            let temp3 = await guild.channels.fetch(interaction.channelId)
            const allMessages = await fetchAll.messages(temp3, {
                reverseArray: true, // Reverse the returned array
                userOnly: true, // Only return messages by users
                botOnly: false, // Only return messages by bots
                pinnedOnly: false, // Only returned pinned messages
            });
            // List of Messages -> Singular Cached Reaction Manager -> List of Reactions -> Singlular Cached User Manager -> List of Users
            for(let i = 0; i < allMessages.length; ++i){
                let reaction_list = await allMessages[i].reactions.cache;
                for (const [react_id,reaction] of reaction_list){
                    let cached_reaction = await reaction.fetch();
                    let user_list = await reaction.users.fetch();
                    // console.log(user_list)
                    for(const [snowflake, user] of user_list){
                        if (user.id !== cached_reaction.message.author.id){
                            const [entry, created] = await global.react_stats.findOrCreate({
                                where: {discordid: cached_reaction.message.author.id, 
                                        react_id: cached_reaction.emoji.toString()},
                                defaults:{
                                    discordid: cached_reaction.message.author.id, 
                                        react_id: cached_reaction.emoji.toString(),
                                        react_number: 1,
                                }
                            });
                            if(!created){
                                // if(!cached_reaction.emoji.id){
                                //     console.log(cached_reaction.message.author + " got react " + cached_reaction.emoji.toString());    
                                // }
                                // else{
                                //     console.log(cached_reaction.message.author + " got react " + cached_reaction.emoji.name);
                                // }
                                await entry.increment('react_number');
                            }
                        }
                    }
                    
                }
            }
            interaction.editReply("Done with DB Generation")
	},
};