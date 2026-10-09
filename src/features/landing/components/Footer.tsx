import { Link } from 'react-router'
import { Logo } from '@/components/common/Logo'

const COLUMNS = [
  {
    title: 'Product',
    links: ['Features', 'Whiteboard', 'Pricing', 'Changelog', 'Roadmap'],
  },
  {
    title: 'Company',
    links: ['About', 'Careers', 'Blog', 'Press kit', 'Contact'],
  },
  {
    title: 'Resources',
    links: ['Help center', 'Teaching guides', 'Community', 'Developers API', 'Status'],
  },
  {
    title: 'Legal',
    links: ['Privacy', 'Terms', 'Security', 'Cookies', 'Accessibility'],
  },
]

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-border bg-card/40">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-6">
          <div className="lg:col-span-2">
            <Link to="/" aria-label="Excurion home">
              <Logo />
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              The virtual classroom that meets anywhere. Built for teachers,
              designed for students.
            </p>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-semibold">{col.title}</h3>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            © {year} Excurion Labs, Inc. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Made with care for educators everywhere.
          </p>
        </div>

        <div className="mt-6 flex flex-col items-center justify-center gap-2 border-t border-border pt-6">
          <a
            href="https://aayushnp.netlify.app"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Aayush Neupane — portfolio"
            className="group flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-foreground"
          >
            <img
              src="/logo.svg"
              alt="Aayush Neupane"
              width={32}
              height={32}
              draggable={false}
              className="h-8 w-8 rounded-full border object-cover transition-colors group-hover:border-primary logo-adapt"
            />
            <span>
              Developed by{' '}
              <span className="text-foreground underline-offset-4 group-hover:text-primary group-hover:underline">
                Aayush Neupane
              </span>
            </span>
          </a>
        </div>
      </div>
    </footer>
  )
}