const invisibleTagFeat = (client, message, participants) => {
    const cleanMessage = message.body.replace(".all", "").trim();
    const mentionedIds = participants.map(p => p.id._serialized);

    // Kirim pesan yang tidak terlihat oleh pengguna
    client.sendMessage(message.from, {
        mentions: mentionedIds
    });

    // Kirim pesan berikutnya tanpa mentions
    return client.sendMessage(message.from, cleanMessage);
}

module.exports = invisibleTagFeat;