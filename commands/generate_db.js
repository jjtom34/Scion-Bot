const { SlashCommandBuilder } = require('@discordjs/builders');
const sequelize = require('sequelize');
const fetchAll = require('discord-fetch-all');
module.exports = {
	    data: new SlashCommandBuilder()
            .setName('generate_db')
            .setDescription('WARNING: DO NOT USE IF NOT JOHNNY OR CAMERON'),
	    async execute(interaction) {
            await interaction.reply("Attempting Db Gen",{ephemeral:true});
            await global.react_stats.sync();
            await global.dng_hof.sync();
            // Get All Messages in a channel
            let guild = await interaction.guild
            let temp3 = await guild.channels.fetch(interaction.channelId)
            // const allMessages = await fetchAll.messages(temp3, {
            //     reverseArray: true, // Reverse the returned array
            //     userOnly: true, // Only return messages by users
            //     botOnly: false, // Only return messages by bots
            //     pinnedOnly: false, // Only returned pinned messages
            // });
            let last_id;
            console.log(Date.now());
            let message_list = await temp3.messages.fetch({limit: 100, cache:true})
            let i = 0;
            // List of Messages -> Singular Cached Reaction Manager -> List of Reactions -> Singlular Cached User Manager -> List of Users
            while(message_list.size !== 0 ){
                for(const message of message_list){
                    let reaction_list = message[1].reactions.cache;
                    for (const [react_id,reaction] of reaction_list){
                        let cached_reaction = await reaction.fetch();
                        let user_list = await reaction.users.fetch();
                        // console.log(user_list)
                        
                        //Check if kek
                        if(cached_reaction.emoji.id === "1002304603339100192" || cached_reaction.emoji.id === "624392576358678529"){
                            // Only do something if above or equal to min
                            const min = await global.dng_hof.min("funny_number");
                            const top_count = await global.dng_hof.count();
                            if (cached_reaction.count >= min || top_count < 10){
                                console.log("Min " + min)
                                console.log("Current " + cached_reaction.count)
                                console.log(message[1].content)
                                const [entry,created] = await global.dng_hof.findOrCreate({
                                    where:{funny_number: cached_reaction.count
                                    },
                                    defaults:{
                                        funny_number: cached_reaction.count, 
                                        message_list: message[1].url
                                    }
                                })
                                // If not a new row, add to existing
                                if(!created){
                                    await entry.update({message_list:entry.message_list + "," +message[1].url}).then(console.log("Update Row"))
                                }
                                else{
                                    console.log("New row");
                                }
                                
                                // Remove a row if over 10
                                if (top_count > 10){
                                    await global.dng_hof.destroy({where:{funny_number:min}}).then(console.log("Removed Lowest"));
                                }
                            }
                            
                        }
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
                last_id = message_list.last().id;
                message_list = await temp3.messages.fetch({limit: 100, cache:true,before:last_id})
                
                i += 1;
            }
            console.log(Date.now());
            interaction.editReply("Done with DB Generation")
	},
};