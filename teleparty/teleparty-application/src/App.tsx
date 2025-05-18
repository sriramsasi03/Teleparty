import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { TelepartyClient, SocketEventHandler, SocketMessageTypes, SessionChatMessage } from 'teleparty-websocket-lib';
import WelcomeScreen from './components/WelcomeScreen';
import ChatRoom from './components/ChatRoom'
function App() {
  const [client, setClient] = useState<TelepartyClient | null>(null);
  const [connected, setConnected] = useState<boolean>(false);
  const [inRoom, setInRoom] = useState<boolean>(false);
  const [roomId, setRoomId] = useState<string>('');
  const [messages, setMessages] = useState<SessionChatMessage[]>([]);
  const [nickname, setNickname] = useState<string>('');
  const [anyoneTyping, setAnyoneTyping] = useState<boolean>(false);
  const [usersTyping, setUsersTyping] = useState<string[]>([]);
  const [selfTyping, setSelfTyping] = useState<boolean>(false);

  useEffect(() => {
    const eventHandler: SocketEventHandler = {
      onConnectionReady: () => {
        console.log('Connected to server');
        setConnected(true);
      },
      onMessage: (message: any) => {
        console.log('Received message:', message);
        if (message.type === SocketMessageTypes.SEND_MESSAGE) {
          const chatMessage = message.data as SessionChatMessage;
          setMessages(prevMessages => [...prevMessages, chatMessage]);
        } else if (message.type === SocketMessageTypes.SET_TYPING_PRESENCE) {
          const typingData = message.data;
          console.log('Typing presence updated:', typingData);
          setAnyoneTyping(typingData.anyoneTyping);
          setUsersTyping(typingData.usersTyping || []);
        }
      },
      onClose: () => {
        console.log('Connection closed');
        setConnected(false);
        alert('Connection closed. Please reload the application.');
      }
    };
    
    try {
      const telepClient = new TelepartyClient(eventHandler);
      setClient(telepClient);
      console.log('Teleparty client created');
    } catch (error) {
      console.error('Error creating Teleparty client:', error);
    }
    return () => {
      if (client) {
        client.teardown();
      }
    };
  }, []);

  const createRoom = async (userNickname: string) => {
    setNickname(userNickname);
    if (client && connected) {
      try {
        const newRoomId = await client.createChatRoom(userNickname);
        setRoomId(newRoomId);
        setInRoom(true);
        console.log('Created room with ID:', newRoomId);
      } catch (error) {
        console.error('Error creating room:', error);
        alert('Failed to create room. Please try again.');
      }
    } else {
      console.error('Cannot create room: client not connected');
      alert('Not connected to the server. Please refresh the page and try again.');
    }
  };

  const joinRoom = async (sessionId: string, userNickname: string) => {
    setNickname(userNickname);
    if (client && connected) {
      try {
        const response = await client.joinChatRoom(userNickname, sessionId);
        setRoomId(sessionId);
        setInRoom(true);
        console.log('Joined room:', sessionId);
        
        if (response && response.messages) {
          setMessages(response.messages);
        }
      } catch (error) {
        console.error('Error joining room:', error);
        alert('Failed to join room. Please check the room ID and try again.');
      }
    } else {
      console.error('Cannot join room: client not connected');
      alert('Not connected to the server. Please refresh the page and try again.');
    }
  };

  const resetTypingStatus = () => {
    setSelfTyping(false);
    if (client && connected && inRoom) {
      client.sendMessage(SocketMessageTypes.SET_TYPING_PRESENCE, { typing: false });
    }
  };
  const sendMessage = (message: string) => {
    if (client && connected && inRoom) {
      resetTypingStatus();
      client.sendMessage(SocketMessageTypes.SEND_MESSAGE, { body: message });
    }
  };
  const updateTypingPresence = (typing: boolean) => {
    if (client && connected && inRoom) {
      console.log(`Sending typing presence update: typing=${typing}, selfTyping was ${selfTyping}`);
      setSelfTyping(typing);
      client.sendMessage(SocketMessageTypes.SET_TYPING_PRESENCE, { typing });
    }
  };

  return (
    <div className="App container">     
     {!inRoom ? (
        <WelcomeScreen
          onCreateRoom={createRoom}
          onJoinRoom={joinRoom}
          connected={connected}
        />
      ) : (
        <ChatRoom
          roomId={roomId}
          messages={messages}
          sendMessage={sendMessage}
          updateTypingPresence={updateTypingPresence}
          nickname={nickname}
          anyoneTyping={anyoneTyping}
          usersTyping={usersTyping}
          selfTyping={selfTyping}
        />
      )}
    </div>
  );
}

export default App;
