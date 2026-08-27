'use client';

import Link from 'next/link';
import { useState } from 'react';
import { GROUND_BUILD, fromRate, rupees } from '@/lib/groundBuild';
import { useEnquiry } from './EnquiryStore';
import ProductImage from './ProductImage';
import { ArrowRightIcon, CheckIcon, PlusIcon } from './Icons';

/**
 * Football and cricket ground construction.
 *
 * Two things drive this design.
 *
 * First, the photographs are the argument. They are the client's own site
 * pictures — concrete going down, a ball being struck against his netting, a
 * hand peeling back the rexine to show the foam underneath. No amount of copy
 * about "quality workmanship" does what that padding photo does in one glance.
 * So the photograph leads each stage and the text supports it, not the
 * reverse.
 *
 * Second, everything here is enquirable. A visitor who recognises their own
 * problem in one of these — the padding, the 38mm net, the 15mm cricket turf
 * — can add that exact thing to their enquiry from where they are standing.
 * Sending them off to hunt for the nearest catalogue entry instead is how an
 * enquiry gets abandoned halfway.
 *
 * Stages 02 and 05 have no photograph: the versions in the client's file were
 * under 420px wide. Rather than stretch them or leave a hole, those cards get
 * a designed panel carrying the stage number. See `_photos` in the JSON.
 */
export default function GroundBuild() {
  const { title, summary, stages, turf, nets, rateNote, banner } = GROUND_BUILD;
  const { addCustom, has } = useEnquiry();
  const [flash, setFlash] = useState<string | null>(null);

  function enquire(id: string, name: string, category: string, note = '') {
    addCustom({ id, name, category, note });
    setFlash(id);
    window.setTimeout(() => setFlash(null), 1800);
  }

  /** One button, used in three places, so the feedback is identical each time. */
  const AddButton = ({
    id,
    name,
    category,
    note,
    small,
  }: {
    id: string;
    name: string;
    category: string;
    note?: string;
    small?: boolean;
  }) => {
    const inBasket = has(id);
    return (
      <button
        type="button"
        className={`enq-btn${small ? ' enq-btn--sm' : ''}${inBasket ? ' is-in' : ''}`}
        onClick={() => enquire(id, name, category, note)}
        aria-label={`Add ${name} to your enquiry`}
      >
        {flash === id || inBasket ? (
          <>
            <CheckIcon size={small ? 13 : 15} />
            {flash === id ? 'Added' : 'In enquiry'}
          </>
        ) : (
          <>
            <PlusIcon size={small ? 13 : 15} />
            {small ? 'Enquire' : 'Add to enquiry'}
          </>
        )}
      </button>
    );
  };

  return (
    <section className="section gb" id="ground-construction">
      {/* ── Banner ────────────────────────────────────────────────────
          A real photograph of his own finished ground, with the heading
          over it. This is the first thing that stops the page looking
          like a brochure template. */}
      <div className="container">
        <div className="gb__banner">
          <ProductImage src={banner.image} alt={banner.alt} priority />
          <div className="gb__banner-body">
            <span className="eyebrow">Sports grounds</span>
            <h2>{title}</h2>
            <p>{summary}</p>
          </div>
        </div>
      </div>

      <div className="container">
        {/* ── Build stages ────────────────────────────────────────────
            Numbered, because the order is the argument: the base comes
            first and everything above it depends on that being right. */}
        <div className="gb__stages">
          {stages.map((stage) => (
            <article className="gbs" key={stage.id}>
              <div className={`gbs__media${stage.image ? '' : ' gbs__media--none'}`}>
                {stage.image ? (
                  <ProductImage src={stage.image} alt={stage.alt ?? stage.title} />
                ) : (
                  <span className="gbs__ghost" aria-hidden="true">
                    {stage.number}
                  </span>
                )}
                <span className="gbs__num">{stage.number}</span>
              </div>

              <div className="gbs__body">
                <div className="gbs__head">
                  <h3 className="gbs__title">{stage.title}</h3>
                  <span className="gbs__rate">
                    {fromRate(stage.fromRate, stage.unit)}
                  </span>
                </div>

                <p className="gbs__summary">{stage.summary}</p>

                <ul className="gbs__detail">
                  {stage.detail.map((d) => (
                    <li key={d}>
                      <CheckIcon size={14} />
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>

                <div className="gbs__foot">
                  <AddButton
                    id={stage.id}
                    name={stage.title}
                    category="Ground construction"
                    note={`Ground construction — stage ${stage.number}`}
                  />
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* ── Turf ─────────────────────────────────────────────────────
            A table, because someone choosing turf is comparing four
            numbers across five products and columns are the only way to
            line those up. Each row carries its own enquiry button. */}
        <div className="spec">
          <div className="spec__head">
            <div>
              <h3 className="spec__title">Turf options</h3>
              <p className="spec__note">
                Pile height is the fibre length. Higher pile with sand and
                rubber infill plays like grass and takes studs; low pile laid
                direct is for cricket strips, where the ball has to skid rather
                than grip.
              </p>
            </div>
          </div>

          <div className="spec__scroll">
            <table className="spec__table">
              <thead>
                <tr>
                  <th scope="col">Turf</th>
                  <th scope="col">Pile</th>
                  <th scope="col">Density</th>
                  <th scope="col">Infill</th>
                  <th scope="col">Warranty</th>
                  <th scope="col">From</th>
                  <th scope="col">
                    <span className="sr-only">Enquire</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {turf.map((t) => (
                  <tr key={t.id}>
                    <th scope="row">
                      <strong>{t.name}</strong>
                      <span className="spec__sub">{t.bestFor}</span>
                    </th>
                    <td>{t.pileHeight}</td>
                    <td>{t.density}</td>
                    <td>{t.infill}</td>
                    <td>{t.warrantyYears} yr</td>
                    <td className="spec__rate">₹{rupees(t.fromRate)}</td>
                    <td>
                      <AddButton
                        small
                        id={t.id}
                        name={t.name}
                        category="Artificial turf"
                        note={`${t.pileHeight} pile · ${t.infill}`}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Netting ──────────────────────────────────────────────────── */}
        <div className="spec">
          <div className="spec__head">
            <div>
              <h3 className="spec__title">Netting options</h3>
              <p className="spec__note">
                Smaller mesh stops a smaller ball. 38mm holds a cricket ball
                where 45mm will not; the heavier 2.5mm braided net goes on the
                sides that take the impact, and the lighter twisted net goes
                overhead.
              </p>
            </div>
          </div>

          <div className="spec__scroll">
            <table className="spec__table">
              <thead>
                <tr>
                  <th scope="col">Net</th>
                  <th scope="col">Thickness</th>
                  <th scope="col">Mesh</th>
                  <th scope="col">Border rope</th>
                  <th scope="col">Warranty</th>
                  <th scope="col">From</th>
                  <th scope="col">
                    <span className="sr-only">Enquire</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {nets.map((n) => (
                  <tr key={n.id}>
                    <th scope="row">
                      <strong>{n.name}</strong>
                    </th>
                    <td>{n.thickness}</td>
                    <td>{n.mesh}</td>
                    <td>{n.borderRope}</td>
                    <td>{n.warrantyYears} yr</td>
                    <td className="spec__rate">₹{rupees(n.fromRate)}</td>
                    <td>
                      <AddButton
                        small
                        id={n.id}
                        name={n.name}
                        category="Sports netting"
                        note={`${n.thickness} · ${n.mesh} mesh`}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="gb__foot">
          <div>
            <h3>Building a ground?</h3>
            <p className="gb__ratenote">{rateNote}</p>
          </div>
          <div className="gb__foot-actions">
            <Link className="btn btn--accent btn--lg" href="/enquiry">
              Review my enquiry
              <ArrowRightIcon size={16} />
            </Link>
            <Link className="btn btn--outline btn--lg" href="/contact">
              Book a site survey
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
