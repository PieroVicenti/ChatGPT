import { useState } from 'react'
import './App.css'
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import {MainContainer, ChatContainer, MessageList, Message, MessageInput, TypingIndicator, MessageSeparator} from '@chatscope/chat-ui-kit-react'
import API_KEY from '../apikey';


function App() {
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState([
    {
      message: "Hello I am ChatGPT",
      sender: "ChatGPT",
      sentTime: new Date().toLocaleDateString('en-GB') + " " + new Date().toLocaleTimeString('en-GB')
    }
  ]);

  const handleSend = async (message) => {
    const newMessage = {
      message: message,
      sender : "user",
      direction : 'outgoing',
      sentTime: new Date().toLocaleDateString('en-GB') + " " + new Date().toLocaleTimeString('en-GB')
    }

    const newMessages = [...messages, newMessage]; //all old messages + new messages
    // update message state
    setMessages(newMessages);

    //set Typing indicator
    setTyping(true);

    // send it over and see response 
    await processMessageToChatGPT(newMessages)

  }

  async function processMessageToChatGPT(chatMessages){
    //chatMessages
    let apiMessages = chatMessages.map((messageObject) => {
      let role = "";
      if(messageObject.sender === "ChatGPT"){
        role = "assistant";
      }else{
        role = "user";
      }
      return {role: role, content: messageObject.message}
    });

    const systemMessage = {
      role : "system",
      content: "Explain all concept like I am 10 years old."
    }

    const apiRequestBody = {
      "model" : "gpt-3.5-turbo",
      "messages" : [
        systemMessage,
        ...apiMessages
      ]
    }

    await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + API_KEY,
        "Content-Type": "application/json" 
      },
      body: JSON.stringify(apiRequestBody)
    }).then((data) =>{
      return data.json();
    }).then((data) => {
      setMessages([...chatMessages, {
        message:  data.choices[0].message.content,
        sender: "ChatGPT",
        sentTime: new Date().toLocaleDateString('en-GB') + " " + new Date().toLocaleTimeString('en-GB')
      }]);
      setTyping(false);
    })
  }

  return (
    <div className="App">
      <div style={{position: "relative", height: "800px", width: "700px"}}>
          <MainContainer>
            <ChatContainer>
              <MessageList scrollBehavior='smooth' typingIndicator={typing ? <TypingIndicator content="ChatGPT is typing"/> : null}>
                {messages.map((message, i) => {
                  return<>
                  <div>
                    <Message color='#FFF' style={{color: 'red'}} key={i} model={message}>
                      <Message.Footer sentTime={message.sentTime} />
                    </Message>
                  </div>  
                </>
                })}
              </MessageList>
              <MessageInput placeholder='Type message here' onSend={handleSend}/>
            </ChatContainer>
          </MainContainer>
      </div>
    </div>
  )
}

export default App
