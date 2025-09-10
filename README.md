# open-context7-web

The web interface component of open-context7.

## Getting Started

1. **Clone the repository**
   ```bash
   git clone git@github.com:rakuv3r/open-context7-web.git
   cd open-context7-web
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your API URL
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## Configuration

Copy `.env.example` to `.env.local` and configure API endpoint if needed:
```bash
cp .env.example .env.local
```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
├── components/             # React components
└── lib/                    # API client
```

## License
[LICENSE](LICENSE)
