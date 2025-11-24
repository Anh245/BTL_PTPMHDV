# Train Station Management System

A modern, full-featured train station management system built with React, Vite, and TailwindCSS.

## 🚀 Features

- **Dashboard**: Real-time overview of stations, trains, and schedules
- **Train Management**: Create, edit, and manage train fleet
- **Station Management**: Organize and track train stations (coming soon)
- **Schedule Management**: Manage train timetables (coming soon)
- **User Authentication**: Secure login and registration system
- **Profile Management**: User profile with preferences and settings
- **Dark Mode**: Toggle between light and dark themes
- **Responsive Design**: Mobile-first design that works on all devices

## 🛠️ Tech Stack

- **React 19** - Modern UI framework
- **Vite** - Lightning-fast build tool
- **React Router v7** - Client-side routing
- **TailwindCSS v4** - Utility-first CSS framework
- **Radix UI** - Accessible UI components
- **React Hook Form** - Form validation
- **Yup** - Schema validation
- **Zustand** - State management
- **Axios** - HTTP client
- **Lucide React** - Beautiful icons
- **Sonner** - Toast notifications

## 📦 Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory:
```env
VITE_API_URL=http://localhost:3000/api
```

4. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 🏗️ Project Structure

```
src/
├── assets/          # Static assets
├── common/          # Common components (Layout, Header, Sidebar)
├── components/      # Reusable components
│   ├── auth/        # Authentication forms
│   └── ui/          # UI components (Button, Card, Input, etc.)
├── hooks/           # Custom React hooks
├── lib/             # Utility libraries
├── pages/           # Page components
├── services/        # API services
├── stores/          # State management
├── App.jsx          # Main app component
├── main.jsx         # Entry point
└── index.css        # Global styles
```

## 🎨 Key Components

### Dashboard
- Overview statistics with real-time data
- Recent stations and trains display
- Today's schedule table
- Interactive status badges

### Train Management
- Full CRUD operations for trains
- Status management (Active, Inactive, Maintenance)
- Train type categorization
- Responsive table view

### Profile
- User information display
- Assigned stations overview
- Recent activity timeline
- Notification preferences
- Security settings

### Authentication
- Login and registration forms
- Form validation with Yup
- JWT token management
- Protected routes

## 🎯 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🔧 Configuration

### TailwindCSS
Custom theme configuration with:
- Custom color palette
- Dark mode support
- Custom animations
- Responsive breakpoints

### Vite
Path aliases configured:
- `@/` maps to `src/`

## 🌙 Dark Mode

The application includes a fully functional dark mode toggle that:
- Persists preference in localStorage
- Applies to all components
- Smooth transitions between modes

## 📱 Responsive Design

The application is fully responsive with:
- Mobile-first approach
- Adaptive sidebar (drawer on mobile)
- Responsive tables and grids
- Touch-friendly interactions

## 🔐 Authentication

The app uses a context-based authentication system:
- JWT token storage
- Automatic token verification
- Protected route handling
- Automatic logout on token expiration

## 🚦 Routing

Routes are organized as follows:
- `/` - Redirects to dashboard
- `/signin` - Login page
- `/signup` - Registration page
- `/dashboard` - Main dashboard (protected)
- `/stations` - Station management (protected)
- `/trains` - Train management (protected)
- `/schedules` - Schedule management (protected)
- `/profile` - User profile (protected)

## 🎨 UI Components

Built with Radix UI primitives for accessibility:
- Button
- Card
- Input
- Label
- Avatar
- Badge
- Tabs
- Switch
- Separator

## 📝 Code Quality Improvements

Recent enhancements:
- ✅ Fixed file naming inconsistencies
- ✅ Removed duplicate authentication implementations
- ✅ Cleaned up CSS and removed duplicate imports
- ✅ Standardized component structure
- ✅ Improved error handling
- ✅ Enhanced TypeScript-ready code patterns
- ✅ Removed hardcoded text and internationalization-ready
- ✅ Optimized bundle size

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Authors

Built with ❤️ by the Train Station Management Team

## 🙏 Acknowledgments

- React team for the amazing framework
- Tailwind CSS for the utility-first CSS framework
- Radix UI for accessible components
- Lucide for beautiful icons
