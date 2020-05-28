const ChatsService = {
  getChatByProject(db, project_id, author_id, recipient_id) {
    return db
      .raw(
        `
      SELECT * FROM chats
      WHERE project_id = ?
      AND (author_id = ? OR author_id = ?)
      AND (recipient_id = ? OR recipient_id = ?)
      LIMIT 1;
      `,
        [project_id, author_id, recipient_id, author_id, recipient_id]
      )
      .then(result => result.rows[0]);
  },
  getChatById(db, id) {
    return db('chats').where({ id }).first();
  },
  getMessageById(db, id) {
    return db('messages').where({ id }).first();
  },
  insertNewChat(db, newChat) {
    return db('chats')
      .insert(newChat)
      .returning('*')
      .then(([chat]) => chat)
      .then(chat => ChatsService.getChatById(db, chat.id));
  },
  insertNewMessage(db, newMessage) {
    return db('messages')
      .insert(newMessage)
      .returning('*')
      .then(([message]) => message)
      .then(message => ChatsService.getMessageById(db, message.id));
  },
  getLatestChatMessages(db, id) {
    return db
      .raw(
        `
      SELECT * FROM (
        SELECT DISTINCT ON (m.chat_id)
        m.chat_id, 
        m.author_id,
        p.name as project_name, 
        m.body, 
        m.date_created, 
        u.first_name,
        u.last_name, 
        c.closed 
        FROM messages m INNER JOIN chats c
        ON m.chat_id = c.id
        INNER JOIN users u ON (CASE WHEN c.recipient_id = ? 
          THEN c.author_id = u.id 
            ELSE c.recipient_id = u.id END)
        INNER JOIN projects p ON p.id = c.project_id 
        WHERE c.recipient_id = ? OR c.author_id = ?
        ORDER BY m.chat_id, m.date_created DESC
      ) t ORDER BY date_created DESC;
      `,
        [id, id, id]
      )
      .then(result => result.rows);
  },
  getAllChatMessages(db, id) {
    return db
      .raw(
        `
      SELECT m.id, 
      m.body, 
      m.author_id, 
      m.date_created, 
      u.first_name as author
      FROM messages m INNER JOIN users u
      ON m.author_id = u.id
      WHERE m.chat_id = ?
      ORDER BY m.date_created DESC; 
      `,
        [id]
      )
      .then(result => result.rows);
  },
  setChatClosed(db, id, closed) {
    return db('chats')
      .where({ id })
      .update({ closed })
      .then(rowsAffected => rowsAffected[0]);
  }
};

module.exports = ChatsService;
