# IPVerse Admin Dashboard

A modern, responsive admin dashboard for managing Web3 IP (Intellectual Property) tokenization projects. Built with Next.js 15, TypeScript, Tailwind CSS, and Radix UI components.

## 🚀 Features

### Core Functionality
- **Authentication System** - Secure login with localStorage-based session management
- **Dashboard Overview** - Real-time KPIs and analytics for IP tokenization projects
- **Project Management** - Create, view, edit, and delete IP tokenization projects
- **Responsive Design** - Mobile-first approach with collapsible sidebar
- **Modern UI/UX** - Clean, professional interface with smooth animations

### Dashboard Features
- **KPI Cards** - Display total projects, investors, tokens sold, and revenue
- **Recent Activity Feed** - Real-time updates on platform activities
- **Project Analytics** - Track token availability, sales progress, and project status

### Project Management
- **Project Creation** - Comprehensive form with image upload capability
- **Project Listing** - Searchable table with filtering and sorting
- **Status Tracking** - Active, Completed, and Upcoming project states
- **Token Management** - Track token prices, availability, and sales

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Lucide React** - Beautiful icon library

### UI Components
- **shadcn/ui** - Modern component library
- **React Hook Form** - Form state management
- **Zod** - Schema validation
- **Sonner** - Toast notifications
- **Recharts** - Data visualization

### Development Tools
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixing

## 📁 Project Structure

```
ipverse-admin/
├── app/                          # Next.js App Router
│   ├── dashboard/                # Dashboard pages
│   │   ├── add-project/         # Project creation
│   │   ├── manage-projects/     # Project management
│   │   └── profile/             # User profile
│   ├── login/                   # Authentication
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Home page
├── components/                   # Reusable components
│   ├── ui/                      # shadcn/ui components
│   ├── AdminSidebar.tsx         # Navigation sidebar
│   ├── AdminTopbar.tsx          # Top navigation bar
│   ├── LayoutDashboard.tsx      # Dashboard layout wrapper
│   ├── ProjectForm.tsx          # Project creation/editing form
│   └── ProjectTable.tsx         # Projects data table
├── lib/                         # Utility functions
├── hooks/                       # Custom React hooks
├── public/                      # Static assets
└── styles/                      # Additional stylesheets
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm, yarn, or pnpm

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ipverse-admin
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Demo Credentials
- **Email**: admin@ipverse.com
- **Password**: password123

## 📱 Usage

### Authentication
1. Navigate to the login page
2. Enter demo credentials or implement your own authentication
3. Upon successful login, you'll be redirected to the dashboard

### Dashboard Navigation
- **Dashboard** - Overview with KPIs and recent activity
- **Add Project** - Create new IP tokenization projects
- **Manage Projects** - View and manage existing projects
- **Profile** - User profile management

### Managing Projects
1. **Create a Project**
   - Navigate to "Add Project"
   - Fill in project details (name, description, token price, etc.)
   - Upload project image (optional)
   - Submit to create the project

2. **View Projects**
   - Go to "Manage Projects"
   - Use search functionality to find specific projects
   - View project status, token availability, and sales data

3. **Edit/Delete Projects**
   - Use action buttons in the project table
   - Edit project details or delete projects (with confirmation)

## 🎨 Customization

### Styling
The project uses Tailwind CSS with a custom design system. You can customize:
- Colors in `tailwind.config.ts`
- Component styles in individual component files
- Global styles in `app/globals.css`

### Components
All UI components are built with shadcn/ui and can be customized:
- Modify component variants in `components/ui/`
- Add new components following the existing pattern
- Update theme colors and spacing

### Data Management
Currently uses mock data. To integrate with a backend:
- Replace localStorage with API calls
- Implement proper authentication
- Add real-time data updates

## 🔧 Configuration

### Environment Variables
Create a `.env.local` file for environment-specific configuration:
```env
NEXT_PUBLIC_API_URL=your-api-url
NEXT_PUBLIC_APP_NAME=IPVerse Admin
```

### Build Configuration
The project includes optimized build settings in `next.config.mjs`:
- TypeScript and ESLint errors ignored during build
- Unoptimized images for development
- Custom webpack configurations if needed

## 📊 Features in Detail

### Dashboard Analytics
- **Total Projects**: Number of active IP tokenization projects
- **Total Investors**: Registered users on the platform
- **Tokens Sold**: Total tokens purchased across all projects
- **Revenue**: Total revenue generated in ETH

### Project Management
- **Project Status**: Active, Completed, Upcoming
- **Token Pricing**: ETH-based token pricing
- **Availability Tracking**: Real-time token availability
- **Date Management**: Start and end dates for projects

### User Experience
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Collapsible Sidebar**: Space-efficient navigation
- **Search & Filter**: Find projects quickly
- **Loading States**: Smooth user feedback
- **Toast Notifications**: Success and error messages

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Configure build settings:
   - Build Command: `npm run build`
   - Output Directory: `.next`
3. Deploy automatically on push to main branch

### Other Platforms
The project can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- Railway
- DigitalOcean App Platform

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔮 Roadmap

### Planned Features
- [ ] Real-time blockchain integration
- [ ] Advanced analytics and reporting
- [ ] Multi-user role management
- [ ] API integration for external services
- [ ] Dark mode support
- [ ] Internationalization (i18n)
- [ ] Advanced project templates
- [ ] Investor management dashboard

### Technical Improvements
- [ ] Unit and integration tests
- [ ] Performance optimization
- [ ] SEO improvements
- [ ] Accessibility enhancements
- [ ] Progressive Web App (PWA) features

---

**Built with ❤️ for the Web3 IP tokenization ecosystem** 