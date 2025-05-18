import React, { useState } from 'react';
import { Form, Button, Container, Row, Col, Card, Alert } from 'react-bootstrap';

interface WelcomeScreenProps {
  onCreateRoom: (nickname: string) => void;
  onJoinRoom: (roomId: string, nickname: string) => void;
  connected: boolean;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onCreateRoom, onJoinRoom, connected }) => {
  const [nickname, setNickname] = useState('');
  const [roomId, setRoomId] = useState('');
  const [activeTab, setActiveTab] = useState<'create' | 'join'>('create');

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (nickname.trim()) {
      onCreateRoom(nickname.trim());
    }
  };

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (nickname.trim() && roomId.trim()) {
      onJoinRoom(roomId.trim(), nickname.trim());
    }
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={6}>
          <Card className="shadow">
            <Card.Header className="text-center bg-primary text-white">
              <h2>Teleparty Chat</h2>
            </Card.Header>
            <Card.Body>
              {!connected && (
                <Alert variant="warning">
                  Connecting to server... Please wait.
                </Alert>
              )}

              <div className="mb-4">
                <div className="d-flex mb-3">
                  <Button
                    variant={activeTab === 'create' ? 'primary' : 'outline-primary'}
                    className="flex-grow-1"
                    onClick={() => setActiveTab('create')}
                  >
                    Create Room
                  </Button>
                  <Button
                    variant={activeTab === 'join' ? 'primary' : 'outline-primary'}
                    className="flex-grow-1"
                    onClick={() => setActiveTab('join')}
                  >
                    Join Room
                  </Button>
                </div>

                {activeTab === 'create' ? (
                  <Form onSubmit={handleCreateRoom}>
                    <Form.Group className="mb-3">
                      <Form.Label>Your Nickname</Form.Label>
                      <Form.Control
                        type="text"
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        placeholder="Enter your nickname"
                        required
                        disabled={!connected}
                      />
                    </Form.Group>
                    <Button 
                      variant="success" 
                      type="submit" 
                      className="w-100" 
                      disabled={!connected || !nickname.trim()}
                    >
                      Create New Chat Room
                    </Button>
                  </Form>
                ) : (
                  <Form onSubmit={handleJoinRoom}>
                    <Form.Group className="mb-3">
                      <Form.Label>Your Nickname</Form.Label>
                      <Form.Control
                        type="text"
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        placeholder="Enter your nickname"
                        required
                        disabled={!connected}
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Room ID</Form.Label>
                      <Form.Control
                        type="text"
                        value={roomId}
                        onChange={(e) => setRoomId(e.target.value)}
                        placeholder="Enter room ID"
                        required
                        disabled={!connected}
                      />
                    </Form.Group>
                    <Button 
                      variant="success" 
                      type="submit" 
                      className="w-100" 
                      disabled={!connected || !nickname.trim() || !roomId.trim()}
                    >
                      Join Chat Room
                    </Button>
                  </Form>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default WelcomeScreen;
