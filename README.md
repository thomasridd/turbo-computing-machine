# Receipt Splitter

A Next.js web application for splitting restaurant bills from receipt photos using OCR technology.

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38B2AC?style=flat-square&logo=tailwind-css)

## Features

- **📸 Receipt Upload** - Upload and preview receipt photos with rotation controls
- **🔍 OCR Processing** - Automatic text extraction using Tesseract.js
- **✏️ Item Editing** - Review, edit, or manually enter line items
- **👥 People Management** - Add multiple people to split the bill
- **🎯 Smart Assignment** - Assign items to people with sharing support
- **💰 Fair Split** - Calculate individual bills with proportional tip distribution

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (Radix UI)
- **OCR Engine**: Tesseract.js
- **State Management**: React Context

## Getting Started

### Prerequisites

- Node.js 20 or higher
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/thomasridd/turbo-computing-machine.git
cd turbo-computing-machine
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production

```bash
npm run build
npm run start
```

## How It Works

### 6-Step Process

1. **Upload Receipt**
   - Select a receipt photo (JPG/PNG, max 10MB)
   - Rotate if needed for better OCR results

2. **OCR Processing**
   - Automatic text extraction from the image
   - Progress indicator shows processing status
   - View raw OCR text for debugging

3. **Edit Items**
   - Review parsed line items
   - Add, edit, or delete items manually
   - Set tip percentage (default 10%)
   - See subtotal and total

4. **Add People**
   - Add names of people splitting the bill
   - Minimum 2 people required
   - Remove people if needed

5. **Assign Items**
   - Matrix view for easy assignment
   - Check boxes to assign items to people
   - Items can be shared among multiple people
   - Visual indicators for unassigned items

6. **View Bills**
   - Individual bills for each person
   - Proportional tip distribution based on subtotal
   - Validation checks total amounts
   - "Start Over" to split another bill

## Receipt Format

The app is optimized for UK receipt format:

```
2 Fish & Chips £18.00
1 Mushy Peas £3.50
3 Coke £7.50

Subtotal: £29.00
10% Service: £2.90
Total: £31.90
```

Expected format: `[quantity] [item name] [£price]`

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deploy to Netlify

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/thomasridd/turbo-computing-machine)

The app includes `netlify.toml` for automatic configuration.

## Project Structure

```
├── app/
│   ├── components/         # React components
│   │   ├── StepIndicator.tsx
│   │   ├── ReceiptUpload.tsx
│   │   ├── OCRProcessor.tsx
│   │   ├── ItemEditor.tsx
│   │   ├── PeopleManager.tsx
│   │   ├── ItemAssignment.tsx
│   │   └── BillSummary.tsx
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Main page with step management
│   └── globals.css         # Global styles
├── components/ui/          # shadcn/ui components
├── context/
│   └── ReceiptContext.tsx  # Global state management
├── lib/
│   ├── types.ts            # TypeScript interfaces
│   ├── ocr.ts              # OCR processing logic
│   ├── parser.ts           # Receipt parsing
│   ├── calculator.ts       # Bill calculation
│   └── utils.ts            # Utility functions
└── netlify.toml            # Netlify configuration
```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Code Style

- TypeScript for type safety
- ESLint for code quality
- Tailwind CSS for styling
- Client-side only (no backend required)

## Features in Detail

### OCR Processing

- Uses Tesseract.js for client-side OCR
- No server/API required
- Progress tracking during processing
- Fallback to manual entry if OCR fails

### Bill Calculation

- Items can be shared among multiple people
- Proportional tip distribution based on individual subtotals
- Validation ensures totals match (±£0.02 tolerance)
- Handles fractional quantities for shared items

### Accessibility

- Semantic HTML
- ARIA labels for screen readers
- Keyboard navigation support
- Focus management between steps
- Proper form labels

### Mobile Support

- Mobile-first responsive design
- Touch-friendly UI elements
- Adequate spacing for touch targets
- Works on all modern browsers

## Limitations

- Client-side only (no data persistence)
- OCR quality depends on image clarity
- Optimized for UK receipt format
- Requires JavaScript enabled

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the MIT License.

## Support

For issues and questions:
- Open an issue on GitHub
- Check existing documentation
- Review the code examples

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- OCR powered by [Tesseract.js](https://tesseract.projectnaptha.com/)
- Icons from [Lucide](https://lucide.dev/)
