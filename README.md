# ⚡ SpeedStreak (TrackSpeed)

SpeedStreak is a high-performance speed tracking mobile application built with **React Native** and **Expo**. It allows users to measure their maximum speed, track their progress through streaks, and compete with friends on a global leaderboard.

## 🚀 Key Features

- **Real-time Speed Tracking**: Accurate speed measurement using `expo-location`.
- **Streaks & Badges**: Gamified experience with daily streaks and unlockable badges.
- **Global Leaderboard**: Compete with users worldwide for the top spot.
- **Social Integration**: Add friends by email and track their progress.
- **Push Notifications**: Stay motivated with daily reminders and achievement alerts.
- **Firebase Backend**: Real-time data synchronization with Firestore and secure Authentication.

## 🛠️ Technical Stack

- **Framework**: [Expo](https://expo.dev/) (React Native)
- **Backend**: Supabase
- **Styling**: Custom theme with support for gradients and haptics.
- **Navigation**: React Navigation (Bottom Tabs & Native Stack)
- **Date Handling**: `date-fns` for streak calculations.

## 📦 Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/ThierGauX/trackspeed.git
    cd trackspeed
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Run the application**:
    - For development: `npx expo start`
    - For Android: `npx expo run:android`
    - For iOS: `npx expo run:ios`

## ⚙️ Configuration

Refer to [GUIDE_INSTALLATION.txt](./GUIDE_INSTALLATION.txt) for a step-by-step guide on how to get started.
**Status**: Firebase configuration is complete, and `google-services.json` is installed.

## 📱 Releases

The production-ready Android APK is available in the `releases/` folder:
- [SpeedStreak.apk](./releases/SpeedStreak.apk)

You can install this directly on your Android device after authorizing installation from unknown sources.

## 💡 Future Improvements

Planned features and ideas can be found in [IDEES_AMELIORATION.md](./IDEES_AMELIORATION.md).
