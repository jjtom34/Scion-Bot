const Sequelize = require('sequelize');
// Good ol https://stackoverflow.com/questions/66793543/reaction-event-discord-js
module.exports = {
    name: 'messageReactionAdd',
    async execute(messageReaction,user){
        console.log("Actually working");
        const message = !messageReaction.message.author
        ? await messageReaction.message.fetch()
        : messageReaction.message;

        if (message.author.id === user.id) {
            // the reaction is coming from the same user who posted the message
            // No self-promotion
            return;
        }

        // the reaction is coming from a different user
        // Add to reaction table or increment number
        await global.react_stats.sync();
        const [entry, created] = await global.react_stats.findOrCreate({
            where: {discordid: messageReaction.message.author.id, 
                    react_id: messageReaction.emoji.name},
            defaults:{
                discordid: messageReaction.message.author.id, 
                react_id: messageReaction.emoji.name,
                react_number: 1,
            }
        });
        if(!created){
            console.log(messageReaction.message.author + " got react " + messageReaction.emoji.identifier);
            await entry.increment('react_number');
        }

        await global.fgotd.sync();
        // If kek, also add to daily FGOTD table
        const [funny, guy] = await global.fgotd.findOrCreate({
            where: {discordid: messageReaction.message.author.id},
            defaults:{
                discordid: messageReaction.message.author.id, 
                funny_number: 1,
            }
        });
        if(!guy){
            console.log(messageReaction.message.author + " is a funny guy");
            await funny.increment('funny_number');
        }
    }
}
