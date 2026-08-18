# 🌸 Ztag - Private Memory Wall

![Ztag Banner](https://your-image-url.com/banner.png) //not update

A full-stack web application built with Next.js and Supabase that allows users to create private memory walls, share them with a partner via a unique code, and store photos with comments.

## 🚀 Live Demo

[View Live Demo](https://photocollab.vercel.app)

## ✨ Features

### 🔐 Authentication
- Email & password signup with email verification
- Secure login/logout
- Protected routes
- Session timeout (30min inactivity)

### 🌿 Memory Walls
- Create private walls with unique shareable codes
- Join existing walls using partner's code
- Two members per wall (owner + friend)
- Delete entire wall with confirmation

### 📸 Photos
- Upload images with date, mood, and comments
- Full-size image preservation
- Creative dark/blue gradient gallery
- Click to view full-size
- Delete individual photos (owner only)

### 💬 Comments
- Add comments to any photo
- Edit your own comments
- View on hover overlay

### 🎨 Design
- Professional dark/blue creative background
- Floating particle animations
- Fully responsive (mobile-first)
- Glassmorphism effects

## 🛠️ Tech Stack

| Category | Technology |
|----------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Auth & DB | Supabase |
| Storage | Supabase Storage |
| Deployment | Vercel |


## 🔒 Security & Privacy

### Private Walls
- **Two-member limit:** Each wall allows only 2 members (owner + friend)
- **Join codes:** Unique 6-character codes for access
- **No public access:** All walls are private by default

### Authentication
- **Email verification:** Required before login
- **Session timeout:** Auto-logout after 30 minutes of inactivity
- **Protected routes:** All dashboard and wall pages require authentication

### Data Protection
- **RLS (Row Level Security):** Database-level access control
- **User-specific data:** Users can only access their own walls
- **Owner controls:** Only wall owner can delete photos and walls
- **Signed URLs:** Images use temporary signed URLs (planned)

### Access Control
| Action | Owner | Friend | Public |
|--------|-------|--------|--------|
| View wall | ✅ | ✅ | ❌ |
| Upload photos | ✅ | ✅ | ❌ |
| Add comments | ✅ | ✅ | ❌ |
| Edit comments | ✅ | ✅ | ❌ |
| Delete photos | ✅ | ❌ | ❌ |
| Delete wall | ✅ | ❌ | ❌ |
| Share code | ✅ | ❌ | ❌ |

### Environment Variables
All sensitive data is stored in environment variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Best Practices Implemented
- ✅ Input validation on all forms
- ✅ XSS prevention (comment sanitization)
- ✅ CSRF protection via Supabase
- ✅ HTTPS enforced (Vercel)
- ✅ File validation (MIME types, size limits)
- ✅ No hardcoded secrets

### Future Security Enhancements
- [ ] Two-factor authentication (2FA)
- [ ] End-to-end encryption for photos
- [ ] Activity logs for audit
- [ ] Rate limiting on API endpoints




## 📁 Project Structure


ztag/
├── app/
│ ├── auth/ # Login, Signup, Verify
│ ├── dashboard/ # User dashboard
│ ├── wall/[id]/ # Dynamic wall pages
│ └── api/ # API routes
├── components/ # Reusable components
├── hooks/ # Custom React hooks
├── lib/supabase/ # Supabase client
├── types/ # TypeScript types
├── utils/ # Helper functions
├── middleware.ts # Route protection
└── README.md





## 🚦 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account (free tier)

### Installation
1. Clone the repository
git clone https://github.com/AvijitDagur12/photocollab.git
cd photocollab

2.Install dependencies
npm install --legacy-peer-deps

3.Set up environment variables
Create .env.local:
env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

4.Run development server
npm run dev


