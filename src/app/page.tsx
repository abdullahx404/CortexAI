import Link from 'next/link';
import {
  Upload,
  Search,
  Bell,
  BarChart3,
  MessageSquare,
  FileSpreadsheet,
  FileText,
  Image,
  Brain,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const features = [
  {
    icon: Upload,
    title: 'Upload Any File',
    description:
      'CSV, Excel, PDF, TXT, or even photos of invoices. CortexAI reads them all.',
  },
  {
    icon: Brain,
    title: 'AI Extracts the Data',
    description:
      'Gemini intelligently structures your files into customers, orders, suppliers, and follow-ups — regardless of column order or format.',
  },
  {
    icon: BarChart3,
    title: 'Business Dashboard',
    description:
      'See pending payments, overdue orders, cheapest suppliers, and today\'s follow-ups at a glance.',
  },
  {
    icon: Search,
    title: 'Search Everything',
    description:
      'Find any customer, order, or supplier across all your uploaded files in seconds.',
  },
  {
    icon: MessageSquare,
    title: 'Ask in Plain English',
    description:
      '"Which customers owe us money?" or "Who is cheapest for office chairs?" — get instant answers from your data.',
  },
  {
    icon: Bell,
    title: 'Follow-up Center',
    description:
      'Auto-generated daily action list from overdue orders and pending payments. Never miss a follow-up.',
  },
];

const problems = [
  'Customer payment records buried in WhatsApp',
  'Supplier prices scattered across old Excel sheets',
  'Pending orders forgotten in email threads',
  'Follow-ups missed because they lived in someone\'s memory',
  'No way to compare supplier prices quickly',
  'Monthly sales trends hidden in stacks of invoices',
];

const fileTypes = [
  { icon: FileSpreadsheet, label: 'CSV & Excel', color: 'text-green-600' },
  { icon: FileText, label: 'PDF & TXT', color: 'text-blue-600' },
  { icon: Image, label: 'Invoice Images', color: 'text-purple-600' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">CortexAI</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/login">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 py-24 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-600 mb-6">
          <Brain className="h-4 w-4" />
          Business Memory Dashboard for SMEs
        </div>
        <h1 className="text-5xl font-bold text-gray-900 leading-tight mb-6 max-w-3xl mx-auto">
          Stop losing business data in WhatsApp and spreadsheets
        </h1>
        <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
          CortexAI turns your scattered business files — invoices, Excel sheets, customer
          records, and supplier quotes — into a searchable dashboard with payment alerts,
          order tracking, and daily follow-ups.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link href="/auth/signup">
            <Button size="lg" className="gap-2">
              Start for Free
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/demo-data">
            <Button size="lg" variant="outline">
              See Live Demo
            </Button>
          </Link>
        </div>

        {/* Supported file types */}
        <div className="mt-12 flex items-center justify-center gap-8 flex-wrap">
          <span className="text-sm text-gray-400">Works with:</span>
          {fileTypes.map(({ icon: Icon, label, color }) => (
            <div key={label} className="flex items-center gap-2 text-sm text-gray-600">
              <Icon className={`h-4 w-4 ${color}`} />
              {label}
            </div>
          ))}
        </div>
      </section>

      {/* Problem */}
      <section className="bg-gray-50 border-y border-gray-200 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              SME owners deal with this every day
            </h2>
            <p className="text-gray-500 mb-8">
              Critical business information is scattered everywhere. Finding answers takes
              hours — or gets missed entirely.
            </p>
            <ul className="space-y-3">
              {problems.map((problem) => (
                <li key={problem} className="flex items-start gap-3 text-gray-700">
                  <span className="mt-0.5 h-5 w-5 shrink-0 rounded-full bg-red-100 flex items-center justify-center text-red-500 text-xs font-bold">
                    ✕
                  </span>
                  {problem}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">How CortexAI works</h2>
          <p className="text-gray-500">Four steps from scattered files to business clarity</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { step: '1', title: 'Upload your files', desc: 'Drop CSV, Excel, PDF, TXT, or invoice images' },
            { step: '2', title: 'AI extracts data', desc: 'Gemini reads and structures the data intelligently' },
            { step: '3', title: 'Dashboard updates', desc: 'Records appear in customers, orders, suppliers tables' },
            { step: '4', title: 'Search & ask', desc: 'Find records or ask questions in plain English' },
          ].map(({ step, title, desc }) => (
            <div key={step} className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white font-bold text-lg">
                {step}
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
              <p className="text-sm text-gray-500">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 border-y border-gray-200 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Everything you need</h2>
            <p className="text-gray-500">Built specifically for SME business operations</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                  <Icon className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-6 py-24 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Ready to get your business organised?
        </h2>
        <p className="text-gray-500 mb-8 max-w-xl mx-auto">
          Upload your files and see your business data come to life in minutes.
          Free to use.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link href="/auth/signup">
            <Button size="lg" className="gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Get Started Free
            </Button>
          </Link>
          <Link href="/auth/login">
            <Button size="lg" variant="outline">
              Sign In
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8">
        <div className="mx-auto max-w-6xl px-6 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-blue-600">
              <Brain className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold text-gray-900">CortexAI</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <a
              href="https://github.com/abdullahx404/CortexAI"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-900 transition-colors"
            >
              GitHub
            </a>
            <span>Built for hackathon demo</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
