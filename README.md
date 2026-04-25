# Diverge

Diverge is a real-time-inspired mobile conversation game where two players answer rapid yes/no questions and discover where their opinions differ.

## Features

- Create or join a room with a code
- Host-controlled category selection
- 10-question timed rounds
- Shared countdown timer based on backend session timestamps
- Waiting screen with live progress polling
- Results screen showing mismatched answers
- Play again flow
- Completed game history
- Local profile persistence for username and avatar

## Tech Stack

### Mobile

![React Native](https://img.shields.io/badge/React%20Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-000000?style=for-the-badge)

### Backend

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)

### Utilities

![Axios](https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge)
![AsyncStorage](https://img.shields.io/badge/AsyncStorage-333333?style=for-the-badge)

## Screens

- Home
- Create Room
- Join Room
- Lobby
- Question Round
- Waiting
- Results
- History
- Profile

## How It Works

1. Player 1 creates a room
2. Player 2 joins with a room code
3. Host selects a category and starts the game
4. Both players answer 10 yes/no questions before the timer ends
5. The app compares both answer sets
6. Only mismatched answers are shown to spark discussion

## Local Setup

### Backend

```bash
cd server
npm install
npm run dev
```

### Environment Variables

Create a .env file inside the server directory:

```env
PORT=5001
MONGO_URI=your_mongodb_atlas_connection_string
```

### Mobile

```bash
cd mobile
npm install
npx expo start
```

Make sure to update the API base URL in the mobile app to match your local machine IP address (for example http://192.168.x.x:5001).

Both your phone and your computer must be on the same network.

### Project Structure

```bash
diverge/
  mobile/      # React Native (Expo) app
  server/      # Express + MongoDB backend
  README.md
```

## API Overview

### Room Endpoints

`POST /api/rooms/create — create a new room`

`POST /api/rooms/join — join an existing room`

`GET /api/rooms/:roomCode — fetch room data`

`PATCH /api/rooms/:roomCode/category — update category (host only)`

`POST /api/rooms/:roomCode/reset — reset room for a new game`

### Session Endpoints

`POST /api/sessions/start — start a game session`

`GET /api/sessions/:roomCode — get active session`

`POST /api/sessions/answer — submit an answer`

`POST /api/sessions/finish — mark player as finished`

`GET /api/sessions/:roomCode/results — get results`

`GET /api/sessions/:roomCode/progress — track progress`

`GET /api/sessions/history/:username — fetch user history`

`GET /api/sessions/details/:sessionId — fetch past session details`

## Key Implementation Details

- Game sessions are stored in MongoDB and include questions, answers, and player states
- Timer synchronization is handled using backend timestamps (startedAt, endsAt)
- Polling is used to simulate real-time updates without WebSockets
- Category selection is persisted in the room and controlled by the host
- Player profile (username and avatar) is stored locally using AsyncStorage

## Future Improvements

- Replace polling with real-time updates using Socket.IO
- Add animations and UI transitions
- Expand question database and categories
- Support more than two players
- Add authentication and user accounts
- Deploy backend and publish the mobile app

## Author

Wail

## License

This project is for portfolio and educational purposes.
