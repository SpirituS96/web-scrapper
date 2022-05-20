const puppeteer = require("puppeteer");
const express = require("express");
const path = require("path");
const PORT = 3000;
const app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));

app.get("/", (req, res) => {
  res.render("index", { data: null });
});

app.post("/", (req, res) => {
  const url = req.body.url;
  const titleSelector = req.body.titleSelector;
  const priceSelector = req.body.priceSelector;
  const imgSelector = req.body.imgSelector;
  const descriptionSelector = req.body.descriptionSelector;
  scrapeProduct(
    url,
    titleSelector,
    priceSelector,
    imgSelector,
    descriptionSelector
  ).then((data) => {
    [title, price, imgUrl, description] = data;
    data =`<p>${title}</p>
    <p>${price}</p>
    <img src="${imgUrl}"/>
    <p>${description}</p>`;
    res.render("index", { data: data });
  });
});

app.listen(process.env.PORT || PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

async function scrapeProduct(url, ...selectors) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.84 Safari/537.36 OPR/85.0.4341.79"
  );// UserAgent
  await page.goto(url);
  const results = []; // массив с финальными результатами поиска
  for (let i = 0; i < selectors.length; i++) {
    // перебор всех селекторов по очереди
    let data = await page.evaluate((selector) => {
      if (document.querySelector(selector)) {
        // если элемент найден
        const attribute =
          document.querySelector(selector).innerText !== ""
            ? document.querySelector(selector).innerText
            : document.querySelector(selector).getAttribute("src"); // получить необходимый атрибут
        return attribute;
      }
      return "not found"; // иначе записать не найдено
    }, selectors[i]);
    results.push(data); // запись в массив результатов поиска
  }
  await browser.close();
  return results;
}
