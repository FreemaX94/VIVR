# VIVR Quick Start Guide

Get the VIVR e-commerce platform running locally in under 10 minutes.

---

## Prerequisites

Before starting, ensure you have:

- **Node.js 18+** ([Download](https://nodejs.org/))
- **PostgreSQL 14+** ([Download](https://www.postgresql.org/download/))
- **Git** ([Download](https://git-scm.com/))
- **Code Editor** (VS Code recommended)

---

## Quick Setup (5 Steps)

### 1. Clone & Install

```bash
# Clone repository
git clone https://github.com/your-org/vivr.git
cd vivr

# Install dependencies
npm install
```

### 2. Setup Database

```bash
# Create PostgreSQL database
createdb vivr

# Or using psql
psql -U postgres -c "CREATE DATABASE vivr;"
```

### 3. Configure Environment

```bash
# Copy environment template
cp .env.example .env.local
```

**Edit `.env.local`** with your values:

```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/vivr"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="run: openssl rand -base64 32"

# Stripe (use test keys)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..." # Skip for now, add later

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Initialize Database

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push
```

### 5. Start Development Server

```bash
npm run dev
```

Open **http://localhost:3000** in your browser.

---

## Verify Setup

### Test the Application

1. **Home Page**: Visit http://localhost:3000
2. **Products**: Click "Produits" in navigation
3. **Register**: Create a test account
4. **Add to Cart**: Add a product to cart
5. **View Cart**: Click cart icon

### Expected Results

- ✅ Pages load without errors
- ✅ Can navigate between pages
- ✅ Can create an account
- ✅ Cart updates in real-time
- ✅ No console errors

---

## Seed Database (Optional)

### Create Test Data

```bash
# Run seed script (if available)
npm run db:seed
```

### Manual Test Data

Open Prisma Studio:

```bash
npm run db:studio
```

Create test data:

1. **Category**: Create "Canapés" category
2. **Product**: Add a test product
   - Name: "Canapé Test"
   - Price: 899.99
   - Stock: 10
   - Category: Select "Canapés"

---

## Development Workflow

### File Structure Overview

```
vivr/
├── app/                # Next.js App Router
│   ├── (shop)/        # Shopping pages
│   ├── (auth)/        # Auth pages
│   └── api/           # API routes
├── components/         # React components
│   ├── ui/            # Base components
│   ├── product/       # Product components
│   └── cart/          # Cart components
├── stores/            # Zustand state management
├── lib/               # Utilities
├── prisma/            # Database
└── types/             # TypeScript types
```

### Common Tasks

**Add a new component:**
```bash
# Create file
touch components/ui/NewComponent.tsx

# Export from index
# Add to components/ui/index.ts
```

**Add a new API route:**
```bash
# Create route
mkdir -p app/api/new-endpoint
touch app/api/new-endpoint/route.ts
```

**Update database schema:**
```bash
# Edit schema
nano prisma/schema.prisma

# Push changes
npm run db:push

# Or create migration
npx prisma migrate dev --name add_new_field
```

---

## Testing

### Run Tests

```bash
# All tests
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

### Test Specific Feature

```bash
# Test cart store
npm test cartStore

# Test product components
npm test ProductCard
```

---

## Stripe Setup (Local Testing)

### 1. Install Stripe CLI

```bash
# macOS
brew install stripe/stripe-cli/stripe

# Windows
scoop install stripe

# Linux
wget https://github.com/stripe/stripe-cli/releases/download/v1.17.0/stripe_1.17.0_linux_x86_64.tar.gz
tar -xvf stripe_1.17.0_linux_x86_64.tar.gz
```

### 2. Login to Stripe

```bash
stripe login
```

### 3. Forward Webhooks

```bash
# Start webhook forwarding
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Copy webhook signing secret to .env.local
# It will look like: whsec_xxx...
```

### 4. Test Payment

```bash
# Trigger test payment
stripe trigger checkout.session.completed
```

**Test Cards:**
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- 3D Secure: `4000 0025 0000 3155`

---

## Common Issues & Solutions

### Issue: Port 3000 already in use

**Solution:**
```bash
# Find and kill process
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 npm run dev
```

### Issue: Database connection error

**Solution:**
```bash
# Check PostgreSQL is running
pg_isready

# Restart PostgreSQL
# macOS
brew services restart postgresql

# Linux
sudo systemctl restart postgresql
```

### Issue: Prisma client not found

**Solution:**
```bash
# Regenerate Prisma client
npm run db:generate
```

### Issue: Module not found

**Solution:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

## VS Code Setup (Recommended)

### Install Extensions

```bash
# Open VS Code
code .
```

**Recommended Extensions:**
1. **ESLint** (dbaeumer.vscode-eslint)
2. **Prettier** (esbenp.prettier-vscode)
3. **Prisma** (Prisma.prisma)
4. **Tailwind CSS IntelliSense** (bradlc.vscode-tailwindcss)
5. **TypeScript Import Sorter** (mike-co.import-sorter)

### VS Code Settings

Create `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "non-relative",
  "[prisma]": {
    "editor.defaultFormatter": "Prisma.prisma"
  }
}
```

---

## Next Steps

### 1. Explore the Codebase

**Start with these files:**
- `C:\Users\freex\Desktop\Projet VS Code\VIVR\app\page.tsx` - Home page
- `C:\Users\freex\Desktop\Projet VS Code\VIVR\app\api\products\route.ts` - Products API
- `C:\Users\freex\Desktop\Projet VS Code\VIVR\stores\cartStore.ts` - Cart state management
- `C:\Users\freex\Desktop\Projet VS Code\VIVR\components\product\ProductCard.tsx` - Product card component

### 2. Read Documentation

- **Full Documentation**: `C:\Users\freex\Desktop\Projet VS Code\VIVR\DOCUMENTATION.md`
- **API Reference**: `C:\Users\freex\Desktop\Projet VS Code\VIVR\docs\API_REFERENCE.md`
- **Architecture**: See DOCUMENTATION.md > Architecture Overview

### 3. Try Making Changes

**Easy starter tasks:**
1. Change homepage hero text
2. Add a new product category
3. Modify cart item quantity limits
4. Update footer links
5. Change color scheme in `tailwind.config.ts`

### 4. Run the Test Suite

```bash
# Ensure all tests pass
npm test

# Watch tests while developing
npm run test:watch
```

---

## Development Tips

### Hot Reload

- **Pages**: Changes auto-reload
- **Components**: Changes auto-reload
- **API Routes**: May need manual refresh
- **Environment Variables**: Requires server restart

### Debugging

**Browser DevTools:**
- Console: View client-side logs
- Network: Inspect API calls
- React DevTools: Inspect component tree

**VS Code Debugger:**

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Next.js: debug server-side",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run-script", "dev"],
      "port": 9229,
      "console": "integratedTerminal"
    }
  ]
}
```

### Database Management

```bash
# Open Prisma Studio (GUI)
npm run db:studio

# View database in terminal
psql vivr

# Common psql commands
\dt              # List tables
\d users         # Describe table
SELECT * FROM users;
```

---

## Production Build

Test production build locally:

```bash
# Build application
npm run build

# Start production server
npm start
```

**Build checks:**
- ✅ No TypeScript errors
- ✅ No ESLint errors
- ✅ All pages render
- ✅ API routes functional
- ✅ Images optimized

---

## Getting Help

### Resources

- **Documentation**: `DOCUMENTATION.md`
- **API Docs**: `docs/API_REFERENCE.md`
- **GitHub Issues**: Report bugs
- **Next.js Docs**: https://nextjs.org/docs
- **Prisma Docs**: https://www.prisma.io/docs

### Common Questions

**Q: How do I add a new page?**
A: Create a `page.tsx` file in `app/` directory

**Q: How do I add a new API endpoint?**
A: Create a `route.ts` file in `app/api/` directory

**Q: How do I update the database schema?**
A: Edit `prisma/schema.prisma` and run `npm run db:push`

**Q: How do I add authentication to a page?**
A: Use `getServerSession()` in Server Components

---

## Checklist

Before starting development:

- [ ] Node.js 18+ installed
- [ ] PostgreSQL running
- [ ] Dependencies installed (`npm install`)
- [ ] `.env.local` configured
- [ ] Database initialized (`npm run db:push`)
- [ ] Dev server running (`npm run dev`)
- [ ] Application accessible at http://localhost:3000
- [ ] Tests passing (`npm test`)
- [ ] VS Code extensions installed
- [ ] Documentation read

---

## Ready to Build!

You're all set! Start building amazing features for VIVR.

**Happy Coding!** 🚀

For detailed documentation, see:
- `C:\Users\freex\Desktop\Projet VS Code\VIVR\DOCUMENTATION.md`
- `C:\Users\freex\Desktop\Projet VS Code\VIVR\docs\API_REFERENCE.md`
