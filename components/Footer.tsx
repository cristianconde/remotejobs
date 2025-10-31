export function Footer() {
  return (
    <footer className="mt-16 border-t border-border py-8">
      <div className="w-full max-w-5xl mx-auto px-4">
        <p className="text-center text-sm text-muted-foreground">
          Built by{' '}
          <a
            href="https://cristianconde.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-foreground hover:text-primary transition-colors underline decoration-muted-foreground hover:decoration-primary"
          >
            Cristian Conde
          </a>
        </p>
      </div>
    </footer>
  );
}
