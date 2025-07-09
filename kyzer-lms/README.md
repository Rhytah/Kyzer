# Kyzer LMS

A modern Learning Management System built with React, Vite, and Supabase.

## 🚀 Quick Start

1. **Clone and Install**
   ```bash
   git clone <your-repo>
   cd kyzer-lms
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env
   # Add your Supabase credentials to .env
   ```

3. **Run Development Server**
   ```bash
   npm run dev
   ```

## 🏗️ Project Structure

```
src/
├── components/     # Reusable UI components
├── pages/         # Route-level components
├── hooks/         # Custom React hooks
├── lib/           # External library configs
├── store/         # State management
└── styles/        # CSS and styling
```

## 🛠️ Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **State**: Zustand
- **Forms**: React Hook Form + Zod
- **Icons**: Lucide React

## 📋 Development Timeline

- **Weeks 1-2**: Foundation & Authentication
- **Weeks 3-6**: Core Features (Courses, Enrollment)
- **Weeks 7-10**: Advanced Features (Quizzes, Corporate)
- **Weeks 11-18**: Polish & Deployment

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors

## 📚 Key Features

### MVP (18 weeks)
- ✅ User Authentication & Profiles
- ✅ Course Management & Enrollment
- ✅ Progress Tracking
- ✅ Quiz System
- ✅ Certificate Generation
- ✅ Corporate Accounts (up to 200 employees)
- ✅ Basic Reporting

### Future Enhancements
- Video Content Integration
- Advanced Analytics
- Mobile Apps
- SCORM Compliance
- Third-party Integrations

## 🏢 Corporate Features

- Multi-tenant architecture
- Employee invitation system
- Team progress tracking
- Admin dashboards
- Annual subscription model

## 🔐 Security

- Row Level Security (RLS) in Supabase
- JWT-based authentication
- Role-based access control
- Email verification
- Password reset functionality

## 📱 Responsive Design

- Mobile-first approach
- Desktop and tablet optimized
- Touch-friendly interface
- Progressive Web App ready

## 🚀 Deployment

The app is configured for easy deployment on:
- **Frontend**: Vercel (recommended)
- **Backend**: Supabase (managed)
- **Files**: Supabase Storage or AWS S3

## 📄 License

This project is proprietary software for Kyzer Solutions.