const xss = require('xss');

const ChatsService = {
  getChatByRequest(db, request_id, author_id, recipient_id) {
    return db
      .raw(
        `
      SELECT * FROM chats
      WHERE request_id = ?
      AND (author_id = ? OR author_id = ?)
      AND (recipient_id = ? OR recipient_id = ?)
      LIMIT 1;
      `,
        [request_id, author_id, recipient_id, author_id, recipient_id]
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
        m.body, 
        (m.author_id != ?) as is_reply, 
        r.id as request_id, 
        r.status as request_status, 
        m.date_created, 
        (SELECT p.name FROM projects p 
          INNER JOIN vacancies v 
          ON v.project_id = p.id 
          WHERE r.vacancy_id = v.id 
          LIMIT 1) as project_name, 
        (SELECT (p.creator_id = ?) as ic FROM projects p 
          INNER JOIN vacancies v 
          ON v.project_id = p.id 
          WHERE r.vacancy_id = v.id 
          LIMIT 1) as project_is_creator, 
        (SELECT v.title FROM vacancies v 
          WHERE v.id = r.vacancy_id LIMIT 1) as vacancy_name, 
        u.first_name,
        u.last_name, 
        u.username as recipient_username, 
        c.closed 
        FROM messages m INNER JOIN chats c
        ON m.chat_id = c.id
        INNER JOIN users u ON (CASE WHEN c.recipient_id = ? 
          THEN c.author_id = u.id 
            ELSE c.recipient_id = u.id END)
        INNER JOIN requests r ON r.id = c.request_id
        WHERE c.recipient_id = ? OR c.author_id = ?
        ORDER BY m.chat_id, m.date_created DESC
      ) t
      `,
        [id, id, id, id, id]
      )
      .then(result => result.rows);
  },
  getAllChatMessages(db, id) {
    return db
      .raw(
        `
      SELECT
      m.body, 
      m.date_created, 
      u.username as author_username 
      FROM messages m INNER JOIN users u
      ON m.author_id = u.id
      WHERE m.chat_id = ?
      ORDER BY m.date_created DESC; 
      `,
        [id]
      )
      .then(result => result.rows);
  },

  validateChat(chat) {
    if (chat.length > 280) {
      return 'message must be fewer than 280 characters';
    }
    if (chat.length < 2) {
      return 'message must be longer than 2 characters';
    }
    let trim = chat.trim();
    if (trim === '') {
      return 'message must have content';
    }
  },

  setChatClosed(db, id, closed) {
    return db('chats')
      .where({ id })
      .update({ closed })
      .then(rowsAffected => rowsAffected[0]);
  },
  serializeChat(chat) {
    return {
      chat_id: chat.chat_id,
      closed_status: chat.closed,
      messages: [
        {
          body: xss(chat.body),
          date_created: chat.date_created,
          isAuthor: !chat.is_reply
        }
      ],
      project: {
        project_name: chat.project_name,
        isOwner: chat.project_is_creator,
        vacancy_name: chat.vacancy_name,
        request_id: chat.request_id,
        request_status: chat.request_status
      },
      recipient: {
        first_name: chat.first_name,
        last_name: chat.last_name,
        recipient_username: chat.recipient_username
      }
    };
  },
  serializeMessage(message) {
    return {
      chat_id: message.chat_id,
      body: xss(message.body),
      date_created: message.date_created,
      author_username: message.author_username,
      isAuthor: message.isAuthor
    };
  }
};

module.exports = ChatsService;
