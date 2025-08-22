# GameVault - Your Gaming Library App

A comprehensive gaming library application that helps you catalog, track, and manage your game collection. Built with React, TypeScript, and Tailwind CSS, featuring integration with the IGDB API for rich game data.

![GameVault Screenshot](https://via.placeholder.com/800x400/1e293b/ffffff?text=GameVault+Screenshot)

## ✨ Features

### 🎮 Game Management
- **Add games** from the IGDB database with rich metadata
- **Track game status**: Playing, Completed, Backlog, Dropped
- **Rate games** on a 0-100 scale
- **Log playtime** in hours
- **Add personal notes** and thoughts about each game
- **Organize by genres and platforms**

### 🔍 Discovery & Search
- **Search games** using the IGDB API
- **Browse popular games** and upcoming releases
- **Filter by genre and platform**
- **Real-time search** with debounced queries

### 📊 Library Organization
- **Grid and list views** for your library
- **Advanced filtering** by status, genre, platform
- **Sorting options** by name, date added, rating, release date
- **Status-based organization** for easy tracking

### 📈 Statistics & Analytics
- **Comprehensive statistics** about your gaming habits
- **Achievement system** for milestones
- **Genre and platform distribution** analysis
- **Completion rate tracking**
- **Personal gaming insights**

### 💾 Data Management
- **Export your library** as JSON backup files
- **Import previous backups** to restore your data
- **Local storage** for persistent data
- **Data validation** and error handling

### 🎨 Beautiful UI/UX
- **Modern dark theme** optimized for gaming aesthetics
- **Responsive design** that works on all devices
- **Smooth animations** and transitions
- **Intuitive navigation** with sidebar layout
- **Gaming-inspired typography** and icons

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ and npm/yarn
- IGDB API credentials (free at [api.igdb.com](https://api.igdb.com/))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/gaming-library-app.git
   cd gaming-library-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   
   Edit `.env.local` and add your IGDB API credentials:
   ```env
   VITE_IGDB_CLIENT_ID=your_igdb_client_id_here
   VITE_IGDB_CLIENT_SECRET=your_igdb_client_secret_here
   ```

4. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

### Getting IGDB API Credentials

1. Visit [https://api.igdb.com/](https://api.igdb.com/)
2. Sign up for a free account
3. Create a new application
4. Copy your Client ID and Client Secret
5. Add them to your `.env.local` file

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Layout.tsx      # Main layout with navigation
│   └── GameCard.tsx    # Game display component
├── contexts/           # React contexts
│   └── GameContext.tsx # Game state management
├── pages/              # Page components
│   ├── Home.tsx        # Dashboard/home page
│   ├── Library.tsx     # Game library management
│   ├── Search.tsx      # Game discovery/search
│   ├── GameDetails.tsx # Individual game details
│   ├── Profile.tsx     # User statistics/profile
│   └── Settings.tsx    # App settings & data management
├── services/           # API services
│   └── igdbService.ts  # IGDB API integration
├── App.tsx             # Main app component
├── main.tsx            # App entry point
└── index.css           # Global styles & Tailwind
```

## 🎯 Usage Guide

### Adding Games
1. Navigate to the **Search** page
2. Search for a game by name
3. Browse results and click **"Add to Library"**
4. The game will be added with "Backlog" status

### Managing Your Library
1. Go to the **Library** page
2. Use filters to organize games by status, genre, or platform
3. Click on any game to view details
4. Change status, add ratings, or update playtime

### Tracking Progress
- **Playing**: Games you're currently playing
- **Completed**: Games you've finished
- **Backlog**: Games you want to play
- **Dropped**: Games you've stopped playing

### Exporting Data
1. Go to **Settings** → **Data Management**
2. Click **"Export Library"** to download a backup
3. Your data is saved as a JSON file with timestamp

## 🛠️ Built With

- **[React 18](https://reactjs.org/)** - Frontend framework
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Vite](https://vitejs.dev/)** - Build tool and dev server
- **[React Router](https://reactrouter.com/)** - Client-side routing
- **[Lucide React](https://lucide.dev/)** - Beautiful icons
- **[IGDB API](https://api.igdb.com/)** - Game database

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors

## 📱 Responsive Design

GameVault is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones
- All modern browsers

## 🎨 Customization

### Themes
- Currently supports dark theme (default)
- Light theme coming soon
- Custom color schemes can be added

### Styling
- All styles use Tailwind CSS classes
- Easy to customize colors, spacing, and components
- CSS variables for consistent theming

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [IGDB](https://igdb.com/) for providing the comprehensive game database API
- [Lucide](https://lucide.dev/) for the beautiful icon set
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- The React and TypeScript communities for excellent tooling

## 🐛 Known Issues

- IGDB API rate limits may apply for heavy usage
- Some games may not have complete metadata
- Mobile performance may vary on older devices

## 🔮 Future Features

- [ ] Light theme support
- [ ] Cloud synchronization
- [ ] Mobile app (React Native)
- [ ] Social features (friend lists, recommendations)
- [ ] Game completion tracking
- [ ] Wishlist functionality
- [ ] Game time tracking integration
- [ ] Achievement sharing
- [ ] Multi-language support

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/yourusername/gaming-library-app/issues) page
2. Create a new issue with detailed information
3. Include your browser, OS, and steps to reproduce

---

**Happy Gaming! 🎮✨**

Built with ❤️ for the gaming community.