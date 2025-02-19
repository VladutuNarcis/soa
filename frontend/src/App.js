import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Row, Col, Form, Button, Table, Alert, Nav, Card } from 'react-bootstrap';

function App() {
  const [token, setToken] = useState('');
  const [activeTab, setActiveTab] = useState('home');
  const [registerName, setRegisterName] = useState('');
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [message, setMessage] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const login = async (username, password) => {
    try {
      const res = await axios.post('http://localhost:3000/login', { username, password });
      setToken(res.data.token);
      setMessage('Logged in successfully.');
    } catch (err) {
      console.error(err);
      setMessage('Login failed');
    }
  };

  const register = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:3000/register', { name: registerName });
      localStorage.setItem('name', localStorage.getItem('name')? 
      localStorage.getItem('name') + ' ' + res.data.user.name : res.data.user.name);
      setMessage(`Employee registered: ${res.data.user.name}`);
      setRegisterName('');
      fetchTasks();
      fetchAnalytics();
    } catch (err) {
      console.error(err);
      setMessage('Registration failed');
    }
  };

  const fetchUserData = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/user', { headers: { Authorization: token } });
      setUser(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTasks = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/task', { headers: { Authorization: token } });
      if(res.data){
      const usernames = localStorage.getItem('name').split(' ');
      let index = 0;
      res.data.forEach(a=>a.userName = usernames[index++]);
    }
      setTasks(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/analytics', { headers: { Authorization: token } });
      setAnalytics(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchUserData();
      fetchTasks();
      fetchAnalytics();
    }
  }, [token]);

  return (
    <Container className="mt-4">
      <Row>
        <Col>
          <h1 className="justify-content-center">Dashboard</h1>
          {message && <Alert variant="info">{message}</Alert>}
          {!token ? (
            <div>
              <Form.Group controlId="username">
                <Form.Label>Username</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </Form.Group>

              <Form.Group controlId="password" className="mt-2">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Form.Group>
              <Button style={{ color: '#00FF00',  backgroundColor: '#343a40', marginTop: '10px'}} onClick={() => login(username, password)}>Login</Button>
            </div>
          ) : (
            <div>
              <Nav
              variant="tabs"
              activeKey={activeTab}
              onSelect={(selectedKey) => setActiveTab(selectedKey)}
              className="justify-content-center"
              style={{
                backgroundColor: '#343a40',
                padding: '10px',
                borderRadius: '5px'
              }}
            >
              <Nav.Item>
                <Nav.Link eventKey="home" style={{ color: '#00FF00' }}>
                  Home
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="register" style={{ color: '#00FF00' }}>
                  Assign Task to Employee
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="tasks" style={{ color: '#00FF00' }}>
                  Tasks
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="analytics" style={{ color: '#00FF00' }}>
                  Analytics
                </Nav.Link>
              </Nav.Item>
            </Nav>


              {activeTab === 'home' && (
                <div className="mt-3">
                  <h3>Welcome {user ? user.name : 'User'}!</h3>
                  <p>
                    Use the tabs above to assign tasks to employees, view tasks in progress and see analytics.
                  </p>
                </div>
              )}

              {activeTab === 'register' && (
                <div className="mt-3">
                  <h3>Assign task to an employee</h3>
                  <Form onSubmit={register}>
                    <Form.Group controlId="formName">
                      <Form.Label>Employee Name</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Enter employee name"
                        value={registerName}
                        onChange={(e) => setRegisterName(e.target.value)}
                        required
                      />
                    </Form.Group>
                    <Button variant="success" type="submit" className="mt-2">Assign</Button>
                  </Form>
                </div>
              )}

              {activeTab === 'tasks' && (
                <div className="mt-3">
                  <h3>Tasks</h3>
                  {tasks.length === 0 ? (
                    <p>No tasks found.</p>
                  ) : (
                    <Table striped bordered hover>
                      <thead>
                        <tr>
                          <th>Task ID</th>
                          <th>User ID</th>
                          <th>Task Description</th>
                          <th>Time amount</th>
                          <th>Employee name</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tasks.map((task) => (
                          <tr key={task.id}>
                            <td>{task.id}</td>
                            <td>{task.userId}</td>
                            <td>{task.item}</td>
                            <td>{task.amount}</td>
                            <td>{task.userName}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  )}
                </div>
              )}

              {activeTab === 'analytics' && (
                <div className="mt-3">
                  <h3>Tasks Analytics Summary</h3>
                  {analytics ? (
                    <Card>
                      <Card.Body>
                        <Row>
                          <Col><strong>Distinct Employees:</strong> {analytics.distinctUsers}</Col>
                          <Col><strong>Total Tasks:</strong> {analytics.totalTasks}</Col>
                        </Row>
                        <Row className="mt-3">
                          <Col><strong>Total Time Amount Value:</strong> {analytics.totalValue} h</Col>
                          <Col><strong>Average Time Amount Value:</strong> {analytics.averageValue} h</Col>
                        </Row>
                      </Card.Body>
                    </Card>
                  ) : (
                    <p>No analytics data available.</p>
                  )}
                </div>
              )}
            </div>
          )}
        </Col>
      </Row>
    </Container>
  );
}

export default App;
