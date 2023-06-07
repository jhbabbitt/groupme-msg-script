const fs = require('fs');
const axios = require('axios');
const { accessToken, groupId } = require('./config');

const baseUrl = 'https://api.groupme.com/v3';
const saveDirectory = 'message_files';

if (!fs.existsSync(saveDirectory)) {
  fs.mkdirSync(saveDirectory);
}

function saveMessagesToFile(messages, fileName) {
  const filePath = `${saveDirectory}/${fileName}`;
  const reversedMessages = messages.slice().reverse(); // Create a copy of the array and reverse it
  const fileContent = reversedMessages.map(message => `${message.name}: ${message.text}`).join('\n');
  fs.writeFileSync(filePath, fileContent);
}

async function fetchMessages(beforeId = null, totalMessages = 0) {
  try {
    const params = {
      token: accessToken,
      limit: 100,
      group_id: groupId,
      before_id: beforeId
    };
    const response = await axios.get(`${baseUrl}/groups/${groupId}/messages`, { params });
    
    if (response.status === 200) {
      const data = response.data.response;
      const messages = data.messages;
      const messageCount = messages.length;
      totalMessages += messageCount;
      
      if (messageCount < 100) {
        const fileName = `messages_${totalMessages}.txt`;
        saveMessagesToFile(messages, fileName);
        
        console.log(`Total messages fetched: ${totalMessages}`);
      } else {
        const lastMessage = messages[messageCount - 1];
        const lastMessageId = lastMessage.id;
        
        const fileName = `messages_${totalMessages}.txt`;
        saveMessagesToFile(messages, fileName);
        
        await fetchMessages(lastMessageId, totalMessages);
      }
    } else {
      console.error(`Error: ${response.status} - ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Start fetching messages
fetchMessages();
