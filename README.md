# 🏠 Floor Plan Analyzer

An AI-powered application that analyzes floor plans and provides intelligent recommendations for improvement.

## ✨ Features

- 🤖 AI-powered floor plan analysis using GPT-4 Vision
- 🎯 Detailed scoring system for:
  - Lighting quality
  - Space utilization
  - Traffic flow
  - Accessibility
- 💡 Smart recommendations with priority levels (High, Medium, Low)
- 🗣️ Interactive chat interface with:
  - Context-aware responses
  - Floor plan-specific suggestions
  - Natural conversation flow
  - Text-to-speech support
- 📊 Real-time analysis results
- 🖼️ Support for JPEG, PNG and WebP images
- ⚡ Fast analysis (typically under 8 seconds)

## 🚀 Getting Started

1. Clone the repository:
```bash
git clone https://github.com/jhn07/ai-floor-analysis.git
cd ai-floor-analysis
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```
Add your API keys to `.env.local`:
- `OPENAI_API_KEY` - for floor plan analysis
- `DEEPGRAM_API_KEY` - for text-to-speech conversion

4. Run the development server:
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🛠️ Built With

- [Next.js 14](https://nextjs.org/) - React Framework
- [TypeScript](https://www.typescriptlang.org/) - Type Safety
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Shadcn/ui](https://ui.shadcn.com/) - UI Components
- [OpenAI API](https://openai.com/) - AI Analysis
- [Deepgram](https://deepgram.com/) - Text-to-Speech
- [Vercel](https://vercel.com/) - Deployment

## 📱 Live Demo

Check out the live demo: [Floor Plan Analyzer](https://ai-floor-analysis.vercel.app/)

## 💡 Usage

1. Upload your floor plan image (JPEG, PNG, or WebP)
2. Wait for AI analysis (typically takes 5-8 seconds)
3. Review the detailed scores and recommendations
4. Use the chat interface to ask specific questions about:
   - Room improvements
   - Layout optimization
   - Lighting suggestions
   - Accessibility enhancements
5. Enable text-to-speech for audio responses

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 👤 Author

**John Doe**
- GitHub: [@jhn07](https://github.com/jhn07)

## 🌟 Acknowledgments

- OpenAI for their powerful GPT-4 Vision API
- Deepgram for text-to-speech capabilities
- Vercel for hosting
- Next.js team for the amazing framework
