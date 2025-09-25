import { Actor, PlaywrightCrawler, log } from 'apify';
import { decode } from 'html-entities';

const DEFAULT_URL = 'https://norcalneca.org/membership/member-directory/';

await Actor.init();

const input = await Actor.getInput() || {};
const startUrl = input.startUrl || DEFAULT_URL;

const crawler = new PlaywrightCrawler({
  requestHandlerTimeoutSecs: 120,
  maxConcurrency: 5,
  navigationTimeoutSecs: 60,
  headless: true,

  async requestHandler({ page, request }) {
    log.info(`Scraping: ${request.url}`);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    await page.evaluate(() => {
      try {
        document.querySelectorAll('details').forEach(d => d.open = true);
      } catch {}
      const selectors = [
        '[aria-expanded="false"]',
        '.accordion .accordion-header',
        '.elementor-accordion .elementor-tab-title',
        '.et_pb_toggle_title',
        '.toggle, .accordion-title, .accordion-button'
      ];
      selectors.forEach(sel => {
        document.querySelectorAll(sel).forEach(el => {
          try { el.click(); } catch {}
        });
      });
    });

    const items = await page.evaluate(() => {
      const uniq = (arr) => Array.from(new Set(arr.filter(Boolean)));
      const clean = (s) => s ? s.replace(/\s+/g, ' ').trim() : null;

      const blocks = [];
      const vcardLinks = Array.from(document.querySelectorAll('a'))
        .filter(a => /Download VCard/i.test(a.textContent || ''));

      for (const a of vcardLinks) {
        let block = a.closest('article, section, .entry-content, .elementor-widget-wrap, .elementor-container, .elementor, .content, div');
        if (!block) block = a.parentElement;

        const websiteEl = Array.from(block.querySelectorAll('a'))
          .find(x => !/Download VCard/i.test(x.textContent || '') && x.href && !x.href.startsWith('mailto:') && !x.href.startsWith('tel:'));
        const website = websiteEl ? websiteEl.href : null;

        const emails = uniq(Array.from(block.querySelectorAll('a[href^="mailto:"]')).map(x => x.href.replace(/^mailto:/i, '').trim()));
        const phoneTextLines = (block.innerText || '').split('\n').map(t => t.trim()).filter(Boolean);

        const name = clean(phoneTextLines[0] || null);
        const city = clean(phoneTextLines[1] || null);
        const workPhone = clean((phoneTextLines.find(l => /^Work Phone:/i.test(l)) || '').replace(/^[^:]*:\s*/, '')) || null;
        const faxPhone  = clean((phoneTextLines.find(l => /^Fax Phone:/i.test(l)) || '').replace(/^[^:]*:\s*/, '')) || null;

        const out = {
          company: name,
          city: city,
          website: website,
          emails: emails,
          phone_work: workPhone,
          phone_fax: faxPhone,
          vcard_url: a.href || null
        };
        blocks.push(out);
      }
      return blocks;
    });

    for (const it of items) {
      await Actor.pushData(it);
    }
  },
});

await crawler.run([{ url: startUrl }]);
log.info('Done. Check the dataset for results.');
await Actor.exit();