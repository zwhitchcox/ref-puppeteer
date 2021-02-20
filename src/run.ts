import * as puppeteer from 'puppeteer'
import { promisify } from 'util'
import * as fs from 'fs-extra'

const NUM_PAGES = 1000

async function main() {
  const browser = await puppeteer.launch({headless: false});
  const page = await browser.newPage();
    await page.setViewport({
    width: 1920,
    height: 1080,
  });
  const click = async (label) => {
    await promisify(setTimeout)(200)
    await page.evaluate((label) => {
      const qs = (arg):any => document.querySelector(arg)
      qs(label).click()
    }, label)
  }
  await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.182 Safari/537.36')

  await page.goto('https://auctions.godaddy.com');
  await promisify(setTimeout)(2000)
  // search
  await click('button[onclick="s_ShowHideAdvSearch();"]')
  await page.evaluate(() => {
    const qsa = arg => Array.from(document.querySelectorAll(arg))
    const qs = (arg):any => document.querySelector(arg)
    qs('#adv_char_Txt').value="5"
  })
  await click('#adv_Dashes_Chk')
  await click('#adv_Digits_Chk')
  await click('#adv_tld1_Chk')
  await promisify(setTimeout)(500)
  await page.evaluate(() => {
    const qsa = arg => Array.from(document.querySelectorAll(arg))
    qsa("button")
      .filter(btn => btn.innerText === "Run Search")[0].click()
  })

  const getDomains = async () => {
    return await page.evaluate(() => {
      const qsa = (arg) => Array.from(document.querySelectorAll(arg))
      const domains = []
      const rows = qsa('#search-table .srRow1').concat(qsa('#search-table .srRow2'))
      for (const row of rows) {
        const domain: any = {}
        domain.name = row.querySelectorAll('td')[3].innerText
        const priceTd = row.querySelectorAll('td')[8]
        const input = priceTd.querySelector('input')
        if (input) {
          domain.price = input.value
        } else {
          domain.price = priceTd.innerText
        }
        domains.push(domain)
      }
      return domains
    })
  }
  await promisify(setTimeout)(1000)
  let domains = await fs.readJson('./data/domains.json')
  let prevDomains = []
  for (let i = 0; i < NUM_PAGES; i++) {
    console.log(`Page ${i}`)
    const newDomains = await getDomains()
    if (newDomains[0].name === prevDomains[0]?.name) {
      await promisify(setTimeout)(3000)
      continue
    }
    prevDomains = newDomains
    domains = domains.concat(newDomains)
    await promisify(setTimeout)(1000)
    await page.evaluate(() => {
      (document.querySelector('a[title="Next"]') as any).click()
    })
    await promisify(setTimeout)(1000)
    await fs.writeFile('./data/domains.json', JSON.stringify(domains))
    await fs.writeFile('./view/public/domains.json', JSON.stringify(domains))
  }
  await browser.close();
}
main()