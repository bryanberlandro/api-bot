const tagAllFeat = async (client, participants, chat) => {
    // Buat daftar nama dengan mentions
    let tagMessage = "[ TAG ALL ]\n\n";
    const mentionedIds = [];

    for (let p of participants) {
        const contact = await client.getContactById(p.id._serialized);
        console.log(contact)
        const name = contact.pushname || contact.number;
        tagMessage += `• @${name}\n`;
        mentionedIds.push(p.id._serialized);
    }

    // Kirim pesan dengan mentions
    return await chat.sendMessage(tagMessage, { mentions: mentionedIds });
}

module.exports = tagAllFeat;