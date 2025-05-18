import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Form, Button, Card, Badge, InputGroup } from 'react-bootstrap';
import { SessionChatMessage } from 'teleparty-websocket-lib';

interface ChatRoomProps {
  roomId: string;
  messages: SessionChatMessage[];
  sendMessage: (message: string) => void;
  updateTypingPresence: (typing: boolean) => void;
  nickname: string;
  anyoneTyping: boolean;
  usersTyping?: string[];
  selfTyping?: boolean;
}

const ChatRoom: React.FC<ChatRoomProps> = ({
  roomId,
  messages,
  sendMessage,
  updateTypingPresence,
  nickname,
  anyoneTyping,
  usersTyping = [],
  selfTyping = false,
}) => {
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const areOthersTyping = (): boolean => {
    const othersTyping = anyoneTyping && !selfTyping && !isTyping;
    
    console.log(`Typing status check: anyoneTyping=${anyoneTyping}, selfTyping=${selfTyping}, isTyping=${isTyping}, result=${othersTyping}`);
    
    return othersTyping;
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isTyping) {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        updateTypingPresence(false);
      }, 2000);
    }
    
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [isTyping, updateTypingPresence]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      sendMessage(newMessage);
      setNewMessage('');
      setIsTyping(false);
      updateTypingPresence(false);
    }
  };

  const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    const hasText = e.target.value.trim() !== '';
    
    if (!isTyping && hasText) {
      setIsTyping(true);
      updateTypingPresence(true);
    } else if (isTyping && !hasText) {
      setIsTyping(false);
      updateTypingPresence(false);
    }
  };
  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  const getUserColor = (permId: string) => {
    let hash = 0;
    for (let i = 0; i < permId.length; i++) {
      hash = permId.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash % 360);
    return `hsl(${hue}, 70%, 40%)`;
  };

  return (
    <Container className="mt-4">
      <Row className="justify-content-center">
        <Col lg={8}>
          <Card className="shadow">
            <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
              <h3>Teleparty Chat</h3>
              <div className="d-flex align-items-center">
                <Badge bg="light" text="dark" className="me-2">
                  Room ID: {roomId}
                </Badge>
                <Badge bg="info" className="me-2">
                  You: {nickname}
                </Badge>
              </div>
            </Card.Header>
            <Card.Body className="chat-container">
              <div className="chat-messages" style={{ maxHeight: '400px', overflowY: 'auto', marginBottom: '20px' }}>
                {messages.map((message) => (
                  <div 
                    key={`${message.permId}-${message.timestamp}`} 
                    className={`message-container mb-2 ${message.isSystemMessage ? 'text-center' : ''}`}
                  >
                    {message.isSystemMessage ? (
                      <div className="system-message text-muted">
                        <small>{message.body}</small>
                      </div>
                    ) : (
                      <div className={`message ${message.userNickname === nickname ? 'message-sent' : 'message-received'}`}>
                        <div 
                          className={`message-bubble p-2 ${message.userNickname === nickname ? 'bg-primary text-white' : 'bg-light'}`}
                          style={{ 
                            borderRadius: '1rem', 
                            display: 'inline-block',
                            maxWidth: '80%',
                            marginLeft: message.userNickname === nickname ? 'auto' : '0',
                            marginRight: message.userNickname === nickname ? '0' : 'auto',
                            color: message.userNickname === nickname ? 'white' : getUserColor(message.permId),
                          }}
                        >
                          {message.userNickname !== nickname && (
                            <div className="font-weight-bold" style={{ fontWeight: 'bold' }}>
                              {message.userNickname}
                            </div>
                          )}
                          <div>{message.body}</div>
                          <div className="text-right">
                            <small className="text-muted" style={{ fontSize: '0.7rem', color: message.userNickname === nickname ? '#e0e0e0' : '#6c757d' }}>
                              {formatTimestamp(message.timestamp)}
                            </small>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              
              {areOthersTyping() && (
                <div className="typing-indicator mb-2">
                  <small className="text-muted">
                    {usersTyping.length > 1 
                      ? `${usersTyping.length} people are typing...`
                      : "Someone is typing..."}
                  </small>
                </div>
              )}
              
              <Form onSubmit={handleSendMessage}>
                <InputGroup>
                  <Form.Control
                    type="text"
                    value={newMessage}
                    onChange={handleMessageChange}
                    placeholder="Type your message here..."
                    autoFocus
                  />
                  <Button variant="primary" type="submit" disabled={!newMessage.trim()}>
                    Send
                  </Button>
                </InputGroup>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ChatRoom;
