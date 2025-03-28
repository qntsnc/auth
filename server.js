const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const app = express();
const port = 8080;

const SECRET_KEY = 'jfashdjasndjkwh';

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

let users = [];

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Токен не предоставлен' });
  }

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Недействительный токен' });
    }
    req.user = user;
    next();
  });
};

app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;
  
  if (users.find(user => user.username === username)) {
    return res.status(400).json({ message: 'Пользователь уже существует' });
  }
  
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newUser = {
      id: users.length + 1,
      username,
      password: hashedPassword
    };
    
    users.push(newUser);
    
    res.status(201).json({ message: 'Пользователь успешно зарегистрирован' });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  
  const user = users.find(user => user.username === username);
  
  if (!user) {
    return res.status(400).json({ message: 'Неверное имя пользователя или пароль' });
  }
  
  try {
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Неверное имя пользователя или пароль' });
    }
    
    const token = jwt.sign(
      { id: user.id, username: user.username },
      SECRET_KEY,
      { expiresIn: '1h' }
    );
    
    res.json({ 
      message: 'Вход выполнен успешно',
      token 
    });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
});

app.get('/api/protected', authenticateToken, (req, res) => {
  res.json({ 
    message: 'защищенные данные', 
    user: req.user.username,
    data: {
      items: [
        { id: 1, name: 'Защищенные данные пользователя 1' },
        { id: 2, name: 'Защищенные данные пользователя 2' },
        { id: 3, name: 'Защищенные данные пользователя 3' }
      ]
    }
  });
});

app.listen(port, () => {
  console.log(`Сервер запущен на порту ${port}`);
});