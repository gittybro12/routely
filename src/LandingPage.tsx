import {
  ArrowDown,
  ArrowRight,
  ClipboardCheck,
  Compass,
  MapPin,
  Route,
} from 'lucide-react';
import './landing.css';

type LandingPageProps = {
  onOpenPlanner: () => void;
  onViewCoverage: () => void;
};

function LandingPage({ onOpenPlanner, onViewCoverage }: LandingPageProps) {
  return (
    <div className="landing-page">
      <main className="landing-main" id="main-content">
        <section className="landing-hero" aria-labelledby="landing-title">
          <div className="landing-copy">
            <div className="journey-eyebrow"><span /> ABUJA, ONE JOURNEY AT A TIME</div>
            <h1 id="landing-title">Know your next <em>Abuja journey.</em></h1>
            <p className="landing-intro">
              Where to board. What to take. Where to change. A clearer way to understand journeys between Abuja’s local transport stops.
            </p>

            <div className="landing-actions">
              <button className="journey-primary landing-primary-cta" onClick={onOpenPlanner}>
                Plan a journey <ArrowRight size={17} />
              </button>
              <a className="journey-secondary landing-secondary-cta" href="#how-it-works">
                How it works <ArrowDown size={14} />
              </a>
            </div>

            <div className="landing-note">
              <span className="landing-note-icon"><Compass size={15} /></span>
              <span>Built around the way people move through Abuja.</span>
            </div>
            <div className="landing-data-status journey-data-notice"><ClipboardCheck size={19} /><p><strong>A guide in progress.</strong> Current journeys use sample connections and stop locations. Our first milestone is ten journeys checked on the ground. <button onClick={onViewCoverage}>See coverage and data status <ArrowRight size={13} /></button></p></div>
          </div>

          <div className="landing-map-wrap" role="img" aria-label="Illustration of a route between Wuse 2 and Jabi">
            <div className="landing-map-card">
              <div className="landing-map-heading">
                <div>
                  <span className="journey-eyebrow">JOURNEY PREVIEW</span>
                  <strong>Wuse 2 <ArrowRight size={17} /> Jabi</strong>
                </div>
                <span className="journey-status status-sample"><ClipboardCheck size={13} /> Sample journey</span>
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
                  <path
                    className="route-line"
                    id="landing-preview-route"
                    d="M101 256 C161 243 180 204 251 207 S342 219 379 168 S455 115 506 124"
                  />
                  <defs>
                    <g id="landing-preview-minibus">
                      <path d="M7 8.5a4.5 4.5 0 0 1 4.5-4.5h18.7a5.5 5.5 0 0 1 5.2 3.7l4.1 12.1a3.2 3.2 0 0 1-3 4.2H10a5 5 0 0 1-5-5v-6a4.5 4.5 0 0 1 2-4.5Z" fill="#fbfdf8" stroke="#315f54" strokeWidth="1.5" />
                      <path d="M10 7h18.8a3.6 3.6 0 0 1 3.4 2.4l1.4 4.1H8.5V9a2 2 0 0 1 1.5-2Z" fill="#c9e6d9" />
                      <path d="M25.5 7h3.3a3.6 3.6 0 0 1 3.4 2.4l1.4 4.1h-7.6V7Z" fill="#a9d4c2" />
                      <path d="M7.5 17.5h28.8" stroke="#d99669" strokeWidth="1.5" strokeLinecap="round" />
                      <circle cx="13" cy="24" r="3.1" fill="#35534a" />
                      <circle cx="31.8" cy="24" r="3.1" fill="#35534a" />
                      <circle cx="13" cy="24" r="1.1" fill="#f5f4ed" />
                      <circle cx="31.8" cy="24" r="1.1" fill="#f5f4ed" />
                    </g>
                  </defs>
                  <g className="route-vehicle" aria-hidden="true">
                    <animateMotion dur="8s" begin="0s" repeatCount="indefinite" rotate="auto" calcMode="paced">
                      <mpath href="#landing-preview-route" />
                    </animateMotion>
                    <use href="#landing-preview-minibus" transform="translate(-22 -16)" />
                  </g>
                  <use
                    className="route-vehicle-static"
                    href="#landing-preview-minibus"
                    transform="translate(272 189)"
                    aria-hidden="true"
                  />
                </svg>
                <div className="landing-route-dot dot-start"><span>A</span></div>
                <div className="landing-route-dot dot-end"><span>B</span></div>
                <div className="landing-map-caption"><Route size={14} /> Illustrative connection</div>
              </div>

              <div className="landing-map-footer">
                <span><span className="field-stop-dot">A</span><span><small>START</small><strong>Wuse 2</strong></span></span>
                <ArrowRight size={16} />
                <span><span className="field-stop-dot destination">B</span><span><small>DESTINATION</small><strong>Jabi</strong></span></span>
              </div>
            </div>
            <p className="landing-preview-note"><MapPin size={14} /> Stop locations and connections need field checking.</p>
          </div>
        </section>

        <section className="landing-features" id="how-it-works" aria-label="What you can do with Routely">
          <article className="landing-feature">
            <span className="landing-feature-icon"><Route size={20} /></span>
            <div><h2>Choose your journey</h2><p>Pick your starting stop and destination, with nearby stops if you need them.</p></div>
          </article>
          <article className="landing-feature">
            <span className="landing-feature-icon"><MapPin size={20} /></span>
            <div><h2>Understand the connections</h2><p>Review each ride, where to change, and what information still needs checking.</p></div>
          </article>
          <article className="landing-feature">
            <span className="landing-feature-icon"><Compass size={20} /></span>
            <div><h2>Keep the steps handy</h2><p>Share a journey link or download the steps to read later.</p></div>
          </article>
        </section>
      </main>

      <footer className="landing-footer">
        <span>Built for everyday Abuja journeys.</span><button onClick={onViewCoverage}>Coverage & data <ArrowRight size={14} /></button>
      </footer>
    </div>
  );
}

export default LandingPage;
