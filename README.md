# Modern Developer Portfolio

A beautiful, responsive portfolio website built with modern technologies and optimized for performance and accessibility.

## 🚀 Features

- **Responsive Design** - Works perfectly on all devices
- **Dark/Light Mode** - Automatic system theme detection with manual toggle
- **Accessibility First** - WCAG 2.1 AA compliant
- **SEO Optimized** - Meta tags, sitemap, robots.txt
- **Performance Optimized** - Lazy loading, image optimization, caching
- **Modern UI/UX** - Glass morphism effects, smooth animations
- **Interactive Elements** - Hover effects, tooltips, smooth transitions
- **Contact Form** - Integrated with Supabase backend
- **GitHub Integration** - Automatic project fetching from GitHub API

## 🛠️ Tech Stack

- **Frontend Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Shadcn/ui
- **Animations**: Framer Motion
- **Form Handling**: React Hook Form with Zod validation
- **Backend**: Supabase (Database, Auth, Edge Functions)
- **Build Tool**: Vite
- **Package Manager**: npm
- **Deployment**: Lovable Platform

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (version 18 or higher)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- [Git](https://git-scm.com/)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/portfolio.git
cd portfolio
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env.local` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GITHUB_TOKEN=your_github_personal_access_token
```

#### Getting Supabase Credentials:
1. Create a project at [supabase.com](https://supabase.com)
2. Go to Settings > API
3. Copy the Project URL and anon key

#### Getting GitHub Token:
1. Go to GitHub Settings > Developer settings > Personal access tokens
2. Generate a new token with `public_repo` scope
3. Copy the token

### 4. Database Setup

The project includes Supabase migrations. Run them in your Supabase project:

```sql
-- Contact submissions table
CREATE TABLE contact_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- Create policies (adjust as needed for your use case)
CREATE POLICY "Allow public inserts" ON contact_submissions
  FOR INSERT WITH CHECK (true);
```

### 5. Start Development Server

```bash
npm run dev
```

The application will open at `http://localhost:5173`

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── ui/              # Shadcn/ui components
│   ├── Hero.tsx         # Hero section
│   ├── About.tsx        # About section
│   ├── Projects.tsx     # Projects showcase
│   ├── Contact.tsx      # Contact section
│   └── ...
├── hooks/               # Custom React hooks
├── lib/                 # Utility functions
├── pages/               # Page components
├── integrations/        # Third-party integrations
└── assets/              # Static assets

public/
├── robots.txt           # SEO robots file
├── sitemap.xml          # SEO sitemap
└── og-image.jpg         # Open Graph image

supabase/
├── functions/           # Edge functions
└── migrations/          # Database migrations
```

## 🎨 Customization

### Colors and Theming

Edit `src/index.css` to customize the color palette:

```css
:root {
  --primary: 270 60% 60%;
  --secondary: 210 80% 55%;
  --accent: 280 70% 70%;
  /* ... more colors */
}
```

### Content

1. **Personal Information**: Edit `src/components/Hero.tsx` and `src/components/About.tsx`
2. **Projects**: Update `src/lib/github.ts` with your GitHub username
3. **Contact Info**: Modify `src/components/ContactInfo.tsx`
4. **SEO**: Update meta tags in `src/components/SEOHead.tsx`

### Components

All components are modular and can be easily customized. Key files:
- `src/components/Hero.tsx` - Landing section
- `src/components/Projects.tsx` - Project showcase
- `src/components/ContactForm.tsx` - Contact form

## 🚀 Deployment

### Lovable Platform (Recommended)

1. Push your code to GitHub
2. Connect your repository to Lovable
3. Configure environment variables
4. Deploy with one click

### Manual Deployment

```bash
# Build for production
npm run build

# Preview the build
npm run preview
```

Deploy the `dist` folder to your hosting provider.

## 📊 Performance & SEO

The portfolio is optimized for:

- **Lighthouse Score**: 95+ across all metrics
- **Core Web Vitals**: Excellent scores
- **Accessibility**: WCAG 2.1 AA compliant
- **SEO**: Proper meta tags, structured data
- **Performance**: Lazy loading, code splitting, image optimization

## 🔧 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript checks
```

## 🐛 Troubleshooting

### Common Issues

1. **Build Errors**: Ensure all environment variables are set
2. **Supabase Connection**: Check your project URL and API key
3. **GitHub API**: Verify your personal access token has correct permissions

### Getting Help

1. Check the [Lovable Documentation](https://docs.lovable.dev)
2. Review [Supabase Documentation](https://supabase.com/docs)
3. Open an issue on GitHub

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

If you need help with setup or customization, feel free to reach out:

- Email: your.email@example.com
- LinkedIn: [Your LinkedIn](https://linkedin.com/in/yourprofile)
- GitHub: [@yourusername](https://github.com/yourusername)

---

Built with ❤️ using [Lovable](https://lovable.dev)