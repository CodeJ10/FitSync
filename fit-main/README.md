# Fitness Quest

A gamified fitness website that uses pose estimation to track exercises and reward users with experience points and levels.

## Features

- Real-time exercise detection using MediaPipe Pose
- User authentication system
- Level and XP progression system
- Leaderboard
- Medieval fantasy theme
- Multiple exercise types:
  - Push-ups
  - Squats
  - Planks
  - Jumping Jacks
  - Arm Raises

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- Webcam

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd fitness-quest
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```
PORT=3000
MONGODB_URI=mongodb://localhost/fitness-quest
SESSION_SECRET=your-secret-key-here
```

4. Start MongoDB on your local machine

## Running the Application

1. Start the development server:
```bash
npm run dev
```

2. Open your browser and navigate to `http://localhost:3000`

## Usage

1. Register a new account or login with existing credentials
2. Choose an exercise from the main menu
3. Allow camera access when prompted
4. Perform the exercise in front of your camera
5. Earn XP and level up as you complete exercises
6. Check your progress on the leaderboard

## Exercise XP Rates

- Push-ups: 5 XP per rep
- Squats: 5 XP per rep
- Plank: 10 XP per second
- Jumping Jacks: 3 XP per rep
- Arm Raises: 2 XP per rep

## Level System

- Level 1: 0-1000 XP
- Level 2: 1001-2000 XP
- Level 3: 2001-3000 XP
And so on...

## Technologies Used

- Node.js
- Express.js
- MongoDB
- MediaPipe Pose
- HTML5 Canvas
- CSS3
- JavaScript (ES6+)

## Security

- Passwords are hashed using bcrypt
- Session-based authentication
- Protected API endpoints
- HTTPS recommended for production

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the ISC License. 