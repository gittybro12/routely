import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Compass,
  MapPin,
  Route,
  Sparkles,
} from 'lucide-react';
import './landing.css';

type LandingPageProps = {
  onOpenPlanner: () => void;
};

function LandingPage({ onOpenPlanner }: LandingPageProps) {
  return (
    <div className="landing-page">
      <header className="landing-nav">
        <a className="landing-brand" href="/" aria-label="Routely home">
          <span className="landing-brand-mark"><MapPin size={19} strokeWidth={2.5} /></span>
          <span className="landing-brand-copy">
            <strong>Routely</strong>
            <small>ABUJA TRANSIT PLANNER</small>
          </span>
        </a>

        <nav className="landing-nav-links" aria-label="Main navigation">
          <a className="landing-nav-anchor" href="#how-it-works">How it works</a>
          <span className="landing-city"><span /> Abuja, Nigeria</span>
          <button className="landing-nav-cta" onClick={onOpenPlanner}>
            Open planner <ArrowUpRight size={15} />
          </button>
        </nav>
      </header>

      <main className="landing-main">
        <section className="landing-hero" aria-labelledby="landing-title">
          <div className="landing-copy">
            <div className="landing-eyebrow"><span /> YOUR CITY, A LITTLE CLOSER</div>
            <h1 id="landing-title">Find your way across <em>Abuja.</em></h1>
            <p className="landing-intro">
              Plan trips between local car parks, see where to transfer, and find nearby options in one clear route planner.
            </p>

            <div className="landing-actions">
              <button className="landing-primary-cta" onClick={onOpenPlanner}>
                Plan your route <ArrowRight size={17} />
              </button>
              <a className="landing-secondary-cta" href="#how-it-works">
                How it works <ArrowDown size={14} />
              </a>
            </div>

            <div className="landing-note">
              <span className="landing-note-icon"><Compass size={15} /></span>
              <span>Built around the way people move through Abuja.</span>
            </div>
          </div>

          <div className="landing-map-wrap" role="img" aria-label="Illustration of a route between Wuse 2 and Jabi">
            <div className="landing-map-card">
              <div className="landing-map-heading">
                <div>
                  <span className="landing-map-kicker">ROUTE PREVIEW</span>
                  <strong>Across the city</strong>
                </div>
                <span className="landing-map-status"><span /> ROUTELY MAP</span>
              </div>

              <div className="landing-map-art">
                <div className="landing-map-label label-wuse"><span />Wuse 2</div>
                <div className="landing-map-label label-jabi"><span />Jabi</div>
                <svg className="landing-street-lines" viewBox="0 0 620 390" preserveAspectRatio="none" aria-hidden="true">
                  <path className="street street-major" d="M-25 92 C83 112 78 174 183 177 S321 88 411 131 S523 271 645 253" />
                  <path className="street" d="M34 -20 C70 65 110 114 96 217 S165 332 206 415" />
                  <path className="street" d="M186 -25 C168 68 248 104 238 182 S196 297 268 416" />
                  <path className="street" d="M345 -24 C313 68 367 108 350 202 S416 315 394 412" />
                  <path className="street" d="M492 -24 C437 70 476 133 525 193 S489 313 566 412" />
                  <path className="street" d="M-22 291 C89 253 155 277 246 248 S423 216 640 304" />
                  <path className="street" d="M-21 350 C92 321 173 354 272 315 S454 277 642 360" />
                  <path className="street street-faint" d="M-16 39 C101 73 191 36 278 64 S451 93 636 34" />
                  <path className="street street-faint" d="M292 -10 C275 72 297 112 290 183 S326 294 310 405" />
                  <path className="route-halo" d="M101 256 C161 243 180 204 251 207 S342 219 379 168 S455 115 506 124" />
                  <path className="route-line" d="M101 256 C161 243 180 204 251 207 S342 219 379 168 S455 115 506 124" />
                </svg>
                <div className="landing-route-dot dot-start"><span>A</span></div>
                <div className="landing-route-dot dot-end"><span>B</span></div>
                <div className="landing-map-caption"><Route size={14} /> A clearer way from A to B</div>
              </div>

              <div className="landing-map-footer">
                <span><span className="landing-footer-dot" /> Start <strong>Wuse 2</strong></span>
                <ArrowRight size={15} />
                <span><span className="landing-footer-dot destination" /> Destination <strong>Jabi</strong></span>
              </div>
            </div>
            <div className="landing-map-float"><Sparkles size={15} /> Local routes, made clearer</div>
          </div>
        </section>

        <section className="landing-features" id="how-it-works" aria-label="What you can do with Routely">
          <article className="landing-feature">
            <span className="landing-feature-icon"><Route size={17} /></span>
            <div><h2>Plan a route</h2><p>Choose your start and destination to see available connections.</p></div>
          </article>
          <article className="landing-feature">
            <span className="landing-feature-icon teal"><MapPin size={17} /></span>
            <div><h2>Find nearby parks</h2><p>Explore car parks and transport hubs around Abuja.</p></div>
          </article>
          <article className="landing-feature">
            <span className="landing-feature-icon amber"><Compass size={17} /></span>
            <div><h2>Know each step</h2><p>Follow your route with transfer guidance along the way.</p></div>
          </article>
        </section>
      </main>

      <footer className="landing-footer">
        <span>Routely</span><span>Abuja journeys, made easier.</span>
      </footer>
    </div>
  );
}

export default LandingPage;
