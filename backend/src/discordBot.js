// Makes a request to Discord API
require("dotenv").config();

const guildId = "420874075351810059";

const channels = [
    { id: '420874075351810060', name: 'Text-Kanäle' },
    { id: '420874075351810061', name: 'geschriebenes' },
    { id: '420874075351810062', name: 'Sprach-Kanäle' },
    { id: '420874075351810063', name: 'Linke obere Schublade' },
    { id: '881304679638781992', name: 'Fridolins Sitzkissenstube' },
    { id: '881304843065655316', name: 'hoffentlich-nicht-geschriebenes' },
    { id: '1316497895733596212', name: 'Browser-VdW' },
    { id: '1316498012352155908', name: 'lobby' },
    { id: '1316498053418582047', name: '1' },
    { id: '1316498107797733376', name: '2' },
    { id: '1316498119697104987', name: '3' },
    { id: '1316498132749520937', name: '4' }
];

const members = [
    { id: '273861570461696001', name: 'fridolin' },
]

function moveUserToChannel(userId, channelName) {

    const channelId = channels.find(channel => channel.name === channelName).id;
    if(!userId || !channelId) {
        console.log(`Invalid userId(${userId}) or channelId(${channelId})`);
        return;
    }

    const url = `https://discord.com/api/v10/guilds/${guildId}/members/${userId}`;
    fetch(url, {
        method: "PATCH",
        headers: {
            "Authorization": "Bot " + process.env.DISCORD_BOT_TOKEN,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            channel_id: channelId
        })
    }).then(response => {
        console.log(response);
    }
    ).catch(error => {
        console.error(error);
    });

}

function getMembers() {
        const url = `https://discord.com/api/v10/guilds/${guildId}/members`;
    
        fetch(url, {
            method: "GET",
            headers: {
                Authorization: "Bot " + process.env.DISCORD_BOT_TOKEN,
            },
        }).then(response => {
            return response.json();
        }
        ).then(data => {
            const m = data.map(member => { return { id: member.user.id, name: member.user?.username, nick: member.nick } }); 
            console.log(m);
            members = m;
            return m;
        }
        ).catch(error => {
            console.error(error);
        });
}

async function getChannels() {

    const channelId = "420874075351810063";

    const url = `https://discord.com/api/guilds/${guildId}/channels`;

    fetch(url, {
        method: "GET",
        headers: {
            "Authorization": "Bot " + process.env.DISCORD_BOT_TOKEN,
        },

    }).then(response => {
        return response.json();
    }).then(data => {
        console.log(data.map(channel => { return { id: channel.id, name: channel.name } }));
    }
    ).catch(error => {
        console.error(error);
    });

}

module.exports = {
    moveUserToChannel,
    getMembers,
    channels,
    members
}

//getMembers();

//moveMeTest();