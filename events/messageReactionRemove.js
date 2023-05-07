const Sequelize = require('sequelize');
// Good ol https://stackoverflow.com/questions/66793543/reaction-event-discord-js
module.exports = {
    name: 'messageReactionRemove',
    async execute(messageReaction,user){
        console.log("unreact");
        const message = !messageReaction.message.author
        ? await messageReaction.message.fetch()
        : messageReaction.message;

        if (message.author.id === user.id) {
            // the reaction is coming from the same user who posted the message
            // No self-promotion
            return;
        }

        // the reaction is coming from a different user
        // remove one from reaction table
        console.log("Non self unreact");
        await global.react_stats.sync();
        // Shouldn't be able to un react to an entry that doensn't exist but just in case
        const [entry, created] = await global.react_stats.findOrCreate({
            where: {discordid: messageReaction.message.author.id, 
                    react_id: messageReaction.emoji.identifier},
            defaults:{
                discordid: messageReaction.message.author.id, 
                react_id: messageReaction.emoji.identifier,
                react_number: 0,
            }
        });
        if(!created){
            console.log(messageReaction.message.author + " removed react " + messageReaction.emoji.identifier);
            await entry.decrement('react_number');
        }

        await global.fgotd.sync();
        // If kek, also subtract from daily FGOTD table
        const [funny, guy] = await global.fgotd.findOrCreate({
            where: {discordid: messageReaction.message.author.id},
            defaults:{
                discordid: messageReaction.message.author.id, 
                funny_number: 0,
            }
        });
        if(!guy){
            console.log(messageReaction.message.author + " is not a funny guy");
            await funny.decrement('funny_number');
        }
    }
}
